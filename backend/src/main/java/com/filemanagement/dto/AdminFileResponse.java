package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class AdminFileResponse {
    private UUID id;
    private String name;
    private String extension;
    private Long size;
    private String ownerUsername;
    private LocalDateTime uploadedAt;
}