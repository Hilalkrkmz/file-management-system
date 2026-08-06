package com.filemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FolderRequest {

    @NotBlank
    private String name;

    private UUID parentFolderId;
}