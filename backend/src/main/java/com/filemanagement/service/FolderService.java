package com.filemanagement.service;

import com.filemanagement.dto.FolderRequest;
import com.filemanagement.dto.FolderResponse;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FolderRepository;
import com.filemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    public FolderService(FolderRepository folderRepository, UserRepository userRepository,
                         FileRepository fileRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi"));
    }

    public FolderResponse createFolder(String username, FolderRequest request) {
        User owner = getUser(username);

        Folder parent = null;
        if (request.getParentFolderId() != null) {
            parent = folderRepository.findById(request.getParentFolderId())
                    .orElseThrow(() -> new IllegalArgumentException("Ust klasor bulunamadi"));

            if (!parent.getOwner().getId().equals(owner.getId())) {
                throw new IllegalArgumentException("Bu klasore erisim yetkiniz yok");
            }
        }

        boolean exists = folderRepository
                .findByOwnerAndParentFolderAndNameAndIsDeletedFalse(owner, parent, request.getName())
                .isPresent();
        if (exists) {
            throw new IllegalArgumentException("Bu isimde bir klasor zaten var");
        }

        Folder folder = new Folder();
        folder.setName(request.getName());
        folder.setParentFolder(parent);
        folder.setOwner(owner);

        folderRepository.save(folder);
        return toResponse(folder);
    }

    public List<FolderResponse> listFolders(String username, UUID parentFolderId) {
        User owner = getUser(username);

        List<Folder> folders;
        if (parentFolderId == null) {
            folders = folderRepository.findByOwnerAndParentFolderIsNullAndIsDeletedFalse(owner);
        } else {
            Folder parent = folderRepository.findById(parentFolderId)
                    .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

            if (!parent.getOwner().getId().equals(owner.getId())) {
                throw new IllegalArgumentException("Bu klasore erisim yetkiniz yok");
            }

            folders = folderRepository.findByOwnerAndParentFolderAndIsDeletedFalse(owner, parent);
        }

        return folders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void deleteFolder(String username, UUID folderId) {
        User owner = getUser(username);

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasoru silme yetkiniz yok");
        }

        softDeleteRecursive(folder);
    }

    private void softDeleteRecursive(Folder folder) {
        LocalDateTime now = LocalDateTime.now();

        folder.setDeleted(true);
        folder.setDeletedAt(now);
        folderRepository.save(folder);

        fileRepository.findByFolderAndIsDeletedFalse(folder).forEach(file -> {
            file.setDeleted(true);
            file.setDeletedAt(now);
            fileRepository.save(file);
        });

        List<Folder> subFolders = folderRepository.findByOwnerAndParentFolderAndIsDeletedFalse(folder.getOwner(), folder);
        subFolders.forEach(this::softDeleteRecursive);
    }

    private FolderResponse toResponse(Folder folder) {
        return new FolderResponse(
                folder.getId(),
                folder.getName(),
                folder.getParentFolder() != null ? folder.getParentFolder().getId() : null,
                folder.getCreatedAt()
        );
    }

    public List<FolderResponse> listTrash(String username) {
        User owner = getUser(username);
        return folderRepository.findByOwnerAndIsDeletedTrue(owner)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void restoreFolder(String username, UUID folderId) {
        User owner = getUser(username);
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasoru geri yukleme yetkiniz yok");
        }

        folder.setDeleted(false);
        folder.setDeletedAt(null);
        folderRepository.save(folder);
    }

    public FolderResponse renameFolder(String username, UUID folderId, String newName) {
        User owner = getUser(username);
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasoru yeniden adlandirma yetkiniz yok");
        }

        folder.setName(newName);
        folderRepository.save(folder);
        return toResponse(folder);
    }

    public FolderResponse moveFolder(String username, UUID folderId, UUID targetFolderId) {
        User owner = getUser(username);

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));
        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasoru tasima yetkiniz yok");
        }

        Folder target = folderRepository.findById(targetFolderId)
                .orElseThrow(() -> new IllegalArgumentException("Hedef klasor bulunamadi"));
        if (!target.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Hedef klasore erisim yetkiniz yok");
        }
        if (target.getId().equals(folder.getId())) {
            throw new IllegalArgumentException("Bir klasor kendi icine tasinamaz");
        }

        folder.setParentFolder(target);
        folderRepository.save(folder);
        return toResponse(folder);
    }

    public void permanentlyDeleteFolder(String username, UUID folderId) {
        User owner = getUser(username);
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasoru silme yetkiniz yok");
        }

        folderRepository.delete(folder);
    }
}