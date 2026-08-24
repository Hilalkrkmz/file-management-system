package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
