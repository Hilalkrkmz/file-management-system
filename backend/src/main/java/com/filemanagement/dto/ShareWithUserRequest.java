package com.filemanagement.dto;

import com.filemanagement.enums.Permission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ShareWithUserRequest {

    @NotNull
    private UUID fileId;

    @NotBlank
    private String targetUsername;

    @NotNull
    private Permission permission;
}