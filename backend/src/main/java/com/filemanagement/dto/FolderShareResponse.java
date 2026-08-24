package com.filemanagement.dto;

import com.filemanagement.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class FolderShareResponse {
    private UUID id;
    private UUID folderId;
    private String folderName;
    private String sharedByUsername;
    private String sharedWithUsername;
    private Permission permission;
}
