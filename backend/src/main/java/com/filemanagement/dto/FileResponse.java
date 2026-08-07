package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class FileResponse {
    private UUID id;
    private String name;
    private String extension;
    private Long size;
    private UUID folderId;
    private LocalDateTime uploadedAt;
}