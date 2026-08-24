package com.filemanagement.repository;

import com.filemanagement.entity.Notification;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    List<Notification> findByRecipientAndIsReadFalse(User recipient);
}
