package com.filemanagement.dto;

import com.filemanagement.enums.Permission;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateShareLinkRequest {

    @NotNull
    private UUID fileId;

    @NotNull
    private Permission permission;

    private Long expiresInHours;
}