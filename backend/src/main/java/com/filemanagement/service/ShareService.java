package com.filemanagement.service;

import com.filemanagement.dto.*;
import com.filemanagement.entity.File;
import com.filemanagement.entity.FileShare;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.FolderShare;
import com.filemanagement.entity.ShareLink;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FileShareRepository;
import com.filemanagement.repository.FileStarRepository;
import com.filemanagement.repository.FolderRepository;
import com.filemanagement.repository.FolderShareRepository;
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
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FileShareRepository fileShareRepository;
    private final FolderShareRepository folderShareRepository;
    private final ShareLinkRepository shareLinkRepository;
    private final NotificationService notificationService;
    private final FileStarRepository fileStarRepository;

    public ShareService(FileRepository fileRepository, FolderRepository folderRepository, UserRepository userRepository,
                        FileShareRepository fileShareRepository, FolderShareRepository folderShareRepository,
                        ShareLinkRepository shareLinkRepository, NotificationService notificationService,
                        FileStarRepository fileStarRepository) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.fileShareRepository = fileShareRepository;
        this.folderShareRepository = folderShareRepository;
        this.shareLinkRepository = shareLinkRepository;
        this.notificationService = notificationService;
        this.fileStarRepository = fileStarRepository;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }

    private File getOwnedFile(User owner, UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Sadece kendi dosyalarınızı paylaşabilirsiniz");
        }
        return file;
    }

    public FileShareResponse shareWithUser(String username, ShareWithUserRequest request) {
        User sharer = getUser(username);
        File file = getOwnedFile(sharer, request.getFileId());

        User target = userRepository.findByEmail(request.getTargetEmail())
                .orElseThrow(() -> new IllegalArgumentException("Bu email ile kayıtlı kullanıcı bulunamadı"));

        if (target.getId().equals(sharer.getId())) {
            throw new IllegalArgumentException("Kendinizle paylaşım yapamazsınız");
        }

        if (fileShareRepository.existsByFileAndSharedWith(file, target)) {
            throw new IllegalArgumentException("Bu dosya zaten bu kullanıcıyla paylaşılmış");
        }

        FileShare share = new FileShare();
        share.setFile(file);
        share.setSharedBy(sharer);
        share.setSharedWith(target);
        share.setPermission(request.getPermission());

        fileShareRepository.save(share);
        notificationService.notifyFileShared(target, sharer.getUsername(), file.getName());

        return new FileShareResponse(share.getId(), file.getId(), file.getName(),
                sharer.getUsername(), target.getUsername(), share.getPermission(), share.getCreatedAt(), false);
    }

    public List<FileShareResponse> listSharedWithMe(String username) {
        User user = getUser(username);
        return fileShareRepository.findBySharedWith(user).stream()
                .map(s -> new FileShareResponse(s.getId(), s.getFile().getId(), s.getFile().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt(),
                        fileStarRepository.findByUserAndFile(user, s.getFile()).isPresent()))
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
                .orElseThrow(() -> new IllegalArgumentException("Link bulunamadı"));

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Bu paylaşım linkinin süresi dolmuş");
        }

        return storageService.load(link.getFile().getStoragePath());
    }

    public File getFileByToken(String token) {
        ShareLink link = shareLinkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link bulunamadı"));

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Bu paylaşım linkinin süresi dolmuş");
        }

        return link.getFile();
    }

    public List<FileShareResponse> listSharesForFile(String username, UUID fileId) {
        User owner = getUser(username);
        File file = getOwnedFile(owner, fileId);

        return fileShareRepository.findByFile(file).stream()
                .map(s -> new FileShareResponse(s.getId(), s.getFile().getId(), s.getFile().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt(), false))
                .collect(Collectors.toList());
    }

    public void removeShare(String username, UUID shareId) {
        User owner = getUser(username);
        FileShare share = fileShareRepository.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Paylaşım bulunamadı"));

        if (!share.getFile().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu paylaşımı kaldırma yetkiniz yok");
        }

        fileShareRepository.delete(share);
    }

    private Folder getOwnedFolder(User owner, UUID folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasör bulunamadı"));
        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Sadece kendi klasörlerinizi paylaşabilirsiniz");
        }
        return folder;
    }

    public FolderShareResponse shareFolderWithUser(String username, ShareFolderRequest request) {
        User sharer = getUser(username);
        Folder folder = getOwnedFolder(sharer, request.getFolderId());

        User target = userRepository.findByEmail(request.getTargetEmail())
                .orElseThrow(() -> new IllegalArgumentException("Bu email ile kayıtlı kullanıcı bulunamadı"));

        if (target.getId().equals(sharer.getId())) {
            throw new IllegalArgumentException("Kendinizle paylaşım yapamazsınız");
        }

        if (folderShareRepository.existsByFolderAndSharedWith(folder, target)) {
            throw new IllegalArgumentException("Bu klasör zaten bu kullanıcıyla paylaşılmış");
        }

        FolderShare share = new FolderShare();
        share.setFolder(folder);
        share.setSharedBy(sharer);
        share.setSharedWith(target);
        share.setPermission(request.getPermission());

        folderShareRepository.save(share);
        notificationService.notifyFolderShared(target, sharer.getUsername(), folder.getName());

        return new FolderShareResponse(share.getId(), folder.getId(), folder.getName(),
                sharer.getUsername(), target.getUsername(), share.getPermission(), share.getCreatedAt());
    }

    public List<FolderShareResponse> listFoldersSharedWithMe(String username) {
        User user = getUser(username);
        return folderShareRepository.findBySharedWith(user).stream()
                .map(s -> new FolderShareResponse(s.getId(), s.getFolder().getId(), s.getFolder().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<FolderShareResponse> listSharesForFolder(String username, UUID folderId) {
        User owner = getUser(username);
        Folder folder = getOwnedFolder(owner, folderId);

        return folderShareRepository.findByFolder(folder).stream()
                .map(s -> new FolderShareResponse(s.getId(), s.getFolder().getId(), s.getFolder().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<FileShareResponse> searchSharedFiles(String username, String query) {
        User user = getUser(username);
        String lower = query.toLowerCase();
        return fileShareRepository.findBySharedWith(user).stream()
                .filter(s -> s.getFile().getName().toLowerCase().contains(lower))
                .map(s -> new FileShareResponse(s.getId(), s.getFile().getId(), s.getFile().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt(),
                        fileStarRepository.findByUserAndFile(user, s.getFile()).isPresent()))
                .collect(Collectors.toList());
    }

    public List<FolderShareResponse> searchSharedFolders(String username, String query) {
        User user = getUser(username);
        String lower = query.toLowerCase();
        return folderShareRepository.findBySharedWith(user).stream()
                .filter(s -> s.getFolder().getName().toLowerCase().contains(lower))
                .map(s -> new FolderShareResponse(s.getId(), s.getFolder().getId(), s.getFolder().getName(),
                        s.getSharedBy().getUsername(), s.getSharedWith().getUsername(), s.getPermission(), s.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void removeFolderShare(String username, UUID shareId) {
        User owner = getUser(username);
        FolderShare share = folderShareRepository.findById(shareId)
                .orElseThrow(() -> new IllegalArgumentException("Paylaşım bulunamadı"));

        if (!share.getFolder().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu paylaşımı kaldırma yetkiniz yok");
        }

        folderShareRepository.delete(share);
    }
}