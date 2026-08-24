package com.filemanagement.service;

import com.filemanagement.dto.*;
import com.filemanagement.entity.File;
import com.filemanagement.entity.FileShare;
import com.filemanagement.entity.ShareLink;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FileShareRepository;
import com.filemanagement.repository.ShareLinkRepository;
import com.filemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShareService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final FileShareRepository fileShareRepository;
    private final ShareLinkRepository shareLinkRepository;
    private final NotificationService notificationService;

    public ShareService(FileRepository fileRepository, UserRepository userRepository,
                        FileShareRepository fileShareRepository, ShareLinkRepository shareLinkRepository,
                        NotificationService notificationService) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.fileShareRepository = fileShareRepository;
        this.shareLinkRepository = shareLinkRepository;
        this.notificationService = notificationService;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi"));
    }

    private File getOwnedFile(User owner, UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Sadece kendi dosyalarinizi paylasabilirsiniz");
        }
        return file;
    }

    public FileShareResponse shareWithUser(String username, ShareWithUserRequest request) {
        User sharer = getUser(username);
        File file = getOwnedFile(sharer, request.getFileId());

        User target = userRepository.findByEmail(request.getTargetEmail())
                .orElseThrow(() -> new IllegalArgumentException("Bu email ile kayitli kullanici bulunamadi"));

        if (target.getId().equals(sharer.getId())) {
            throw new IllegalArgumentException("Kendinizle paylasim yapamazsiniz");
        }

        if (fileShareRepository.existsByFileAndSharedWith(file, target)) {
            throw new IllegalArgumentException("Bu dosya zaten bu kullaniciyla paylasilmis");
        }

        FileShare share = new FileShare();
        share.setFile(file);
        share.setSharedBy(sharer);
        share.setSharedWith(target);
        share.setPermission(request.getPermission());

        fileShareRepository.save(share);
        notificationService.notifyFileShared(target, sharer.getUsername(), file.getName());

        return new FileShareResponse(share.getId(), file.getId(), file.getName(),
                sharer.getUsername(), target.getUsername(), share.getPermission());
    }

    public List<FileShareResponse> listSharedWithMe(String username) {
        User user = getUser(username);
        return fileShareRepository.findBySharedWith(user).stream()
                .map(s -> new FileShareResponse(s.getId(), s.getFile().getId(), s.getFile().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission()))
                .collect(Collectors.toList());
    }

    public ShareLinkResponse createShareLink(String username, CreateShareLinkRequest request) {
        User owner = getUser(username);
        File file = getOwnedFile(owner, request.getFileId());

        ShareLink link = new ShareLink();
        link.setFile(file);
        link.setCreatedBy(owner);
        link.setPermission(request.getPermission());
        link.setToken(UUID.randomUUID().toString());

        if (request.getExpiresInHours() != null) {
            link.setExpiresAt(LocalDateTime.now().plusHours(request.getExpiresInHours()));
        }

        shareLinkRepository.save(link);
        return new ShareLinkResponse(link.getId(), link.getToken(), link.getExpiresAt());
    }

    public byte[] downloadViaLink(String token, FileStorageService storageService) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link bulunamadi"));

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Bu paylasim linkinin suresi dolmus");
        }

        return storageService.load(link.getFile().getStoragePath());
    }

    public File getFileByToken(String token) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link bulunamadi"));

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Bu paylasim linkinin suresi dolmus");
        }

        return link.getFile();
    }

    public List<FileShareResponse> listSharesForFile(String username, UUID fileId) {
        User owner = getUser(username);
        File file = getOwnedFile(owner, fileId);

        return fileShareRepository.findByFile(file).stream()
                .map(s -> new FileShareResponse(s.getId(), s.getFile().getId(), s.getFile().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission()))
                .collect(Collectors.toList());
    }

    public void removeShare(String username, UUID shareId) {
        User owner = getUser(username);
        FileShare share = fileShareRepository.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Paylasim bulunamadi"));

        if (!share.getFile().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu paylasimi kaldirma yetkiniz yok");
        }

        fileShareRepository.delete(share);
    }
}