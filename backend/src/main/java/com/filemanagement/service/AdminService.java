package com.filemanagement.service;

import com.filemanagement.dto.AdminFileResponse;
import com.filemanagement.dto.UserResponse;
import com.filemanagement.entity.File;
import com.filemanagement.entity.Folder;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FolderRepository;
import com.filemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;

    public AdminService(UserRepository userRepository, FileRepository fileRepository,
                        FolderRepository folderRepository) {
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<AdminFileResponse> listAllFiles() {
        return fileRepository.findAll().stream()
                .filter(f -> !f.isDeleted())
                .map(f -> new AdminFileResponse(f.getId(), f.getName(), f.getExtension(), f.getSize(),
                        f.getOwner().getUsername(), f.getUploadedAt()))
                .collect(Collectors.toList());
    }

    public void deleteFile(UUID fileId) {
        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));
        file.setDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        fileRepository.save(file);
    }

    public void deleteFolder(UUID folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));
        folder.setDeleted(true);
        folder.setDeletedAt(LocalDateTime.now());
        folderRepository.save(folder);
    }

    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Kullanici bulunamadi");
        }
        userRepository.deleteById(userId);
    }
}