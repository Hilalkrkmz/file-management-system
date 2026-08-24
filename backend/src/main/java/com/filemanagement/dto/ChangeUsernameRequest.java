package com.filemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeUsernameRequest {

    @NotBlank
    @Size(min = 3, max = 30)
    private String newUsername;

    @NotBlank
    private String currentPassword;
}
