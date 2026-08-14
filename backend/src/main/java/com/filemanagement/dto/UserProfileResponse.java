package com.filemanagement.dto;

import com.filemanagement.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String email;
    private Role role;
    private boolean hasPhoto;
}