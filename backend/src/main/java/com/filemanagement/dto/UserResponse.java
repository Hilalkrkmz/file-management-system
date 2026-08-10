package com.filemanagement.dto;

import com.filemanagement.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private Role role;
    private long storageQuotaMb;
    private LocalDateTime createdAt;
}