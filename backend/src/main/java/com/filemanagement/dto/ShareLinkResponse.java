package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ShareLinkResponse {
    private UUID id;
    private String token;
    private LocalDateTime expiresAt;
}