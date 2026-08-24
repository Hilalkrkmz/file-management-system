package com.filemanagement.service;

import com.filemanagement.dto.NotificationResponse;
import com.filemanagement.entity.Notification;
import com.filemanagement.entity.User;
import com.filemanagement.repository.NotificationRepository;
import com.filemanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }

    public void notifyFileShared(User recipient, String sharerUsername, String fileName) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(sharerUsername + " sizinle \"" + fileName + "\" dosyasını paylaştı");
        notificationRepository.save(notification);
    }

    public void notifyFolderShared(User recipient, String sharerUsername, String folderName) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(sharerUsername + " sizinle \"" + folderName + "\" klasörünü paylaştı");
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> listNotifications(String username) {
        User user = getUser(username);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(n -> new NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public long unreadCount(String username) {
        User user = getUser(username);
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    public void markAllAsRead(String username) {
        User user = getUser(username);
        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalse(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
