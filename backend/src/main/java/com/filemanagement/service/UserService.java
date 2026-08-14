package com.filemanagement.service;

import com.filemanagement.dto.UserProfileResponse;
import com.filemanagement.entity.User;
import com.filemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService storageService;

    public UserService(UserRepository userRepository, FileStorageService storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi"));
    }

    public UserProfileResponse getProfile(String username) {
        User user = getUser(username);
        return new UserProfileResponse(user.getUsername(), user.getEmail(), user.getRole(),
                user.getProfilePhotoPath() != null);
    }

    public void uploadPhoto(String username, MultipartFile photo) {
        User user = getUser(username);

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Sadece resim dosyalari yuklenebilir");
        }

        long maxBytes = 5 * 1024 * 1024;
        if (photo.getSize() > maxBytes) {
            throw new IllegalArgumentException("Profil fotografi 5MB limitini asiyor");
        }

        String storageKey = "avatar_" + UUID.randomUUID();
        String storagePath = storageService.store(photo, storageKey);

        user.setProfilePhotoPath(storagePath);
        userRepository.save(user);
    }

    public byte[] getPhoto(String username) {
        User user = getUser(username);
        if (user.getProfilePhotoPath() == null) {
            throw new IllegalArgumentException("Profil fotografi yok");
        }
        return storageService.load(user.getProfilePhotoPath());
    }
}