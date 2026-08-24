package com.filemanagement.service;

import com.filemanagement.dto.AuthResponse;
import com.filemanagement.dto.UserProfileResponse;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FileAccessRepository;
import com.filemanagement.repository.FileShareRepository;
import com.filemanagement.repository.FolderShareRepository;
import com.filemanagement.repository.NotificationRepository;
import com.filemanagement.repository.UserRepository;
import com.filemanagement.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FileStorageService storageService;
    private final PasswordEncoder passwordEncoder;
    private final FolderService folderService;
    private final FileShareRepository fileShareRepository;
    private final FolderShareRepository folderShareRepository;
    private final NotificationRepository notificationRepository;
    private final FileAccessRepository fileAccessRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, FileStorageService storageService,
                       PasswordEncoder passwordEncoder, FolderService folderService,
                       FileShareRepository fileShareRepository, FolderShareRepository folderShareRepository,
                       NotificationRepository notificationRepository, FileAccessRepository fileAccessRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.passwordEncoder = passwordEncoder;
        this.folderService = folderService;
        this.fileShareRepository = fileShareRepository;
        this.folderShareRepository = folderShareRepository;
        this.notificationRepository = notificationRepository;
        this.fileAccessRepository = fileAccessRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
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
            throw new IllegalArgumentException("Sadece resim dosyaları yüklenebilir");
        }

        long maxBytes = 5 * 1024 * 1024;
        if (photo.getSize() > maxBytes) {
            throw new IllegalArgumentException("Profil fotoğrafı 5MB limitini aşıyor");
        }

        String storageKey = "avatar_" + UUID.randomUUID();
        String storagePath = storageService.store(photo, storageKey);

        user.setProfilePhotoPath(storagePath);
        userRepository.save(user);
    }

    public byte[] getPhoto(String username) {
        User user = getUser(username);
        if (user.getProfilePhotoPath() == null) {
            throw new IllegalArgumentException("Profil fotoğrafı yok");
        }
        return storageService.load(user.getProfilePhotoPath());
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = getUser(username);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Mevcut şifre yanlış");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void changeEmail(String username, String newEmail, String currentPassword) {
        User user = getUser(username);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Şifre yanlış");
        }

        if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("Bu email zaten kullanılıyor");
        }

        user.setEmail(newEmail);
        userRepository.save(user);
    }

    public AuthResponse changeUsername(String username, String newUsername, String currentPassword) {
        User user = getUser(username);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Şifre yanlış");
        }

        if (!newUsername.equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
            throw new IllegalArgumentException("Bu kullanıcı adı zaten kullanılıyor");
        }

        user.setUsername(newUsername);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public void deleteOwnAccount(String username, String currentPassword) {
        User user = getUser(username);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Şifre yanlış");
        }

        fileShareRepository.deleteAll(fileShareRepository.findBySharedWith(user));
        folderShareRepository.deleteAll(folderShareRepository.findBySharedWith(user));
        notificationRepository.deleteAll(notificationRepository.findByRecipientOrderByCreatedAtDesc(user));
        fileAccessRepository.deleteAll(fileAccessRepository.findByUserOrderByAccessedAtDesc(user));

        folderService.purgeAllForOwner(user);

        if (user.getProfilePhotoPath() != null) {
            storageService.delete(user.getProfilePhotoPath());
        }

        userRepository.delete(user);
    }
}