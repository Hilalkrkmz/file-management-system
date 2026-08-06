package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class FolderResponse {
    private UUID id;
    private String name;
    private UUID parentFolderId;
    private LocalDateTime createdAt;
}