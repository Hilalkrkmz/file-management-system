package com.filemanagement.dto;

import com.filemanagement.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class FileShareResponse {
    private UUID id;
    private UUID fileId;
    private String fileName;
    private String sharedByUsername;
    private String sharedWithUsername;
    private Permission permission;
    private LocalDateTime createdAt;
    private boolean starred;
}