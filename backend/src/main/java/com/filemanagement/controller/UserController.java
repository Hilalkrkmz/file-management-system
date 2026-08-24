package com.filemanagement.controller;

import com.filemanagement.dto.AuthResponse;
import com.filemanagement.dto.ChangeEmailRequest;
import com.filemanagement.dto.ChangePasswordRequest;
import com.filemanagement.dto.ChangeUsernameRequest;
import com.filemanagement.dto.DeleteAccountRequest;
import com.filemanagement.dto.UserProfileResponse;
import com.filemanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadPhoto(@RequestParam("photo") MultipartFile photo,
                                            Authentication authentication) {
        userService.uploadPhoto(authentication.getName(), photo);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/photo")
    public ResponseEntity<ByteArrayResource> photo(Authentication authentication) {
        byte[] data = userService.getPhoto(authentication.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(new ByteArrayResource(data));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Authentication authentication) {
        userService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/email")
    public ResponseEntity<Void> changeEmail(@Valid @RequestBody ChangeEmailRequest request,
                                            Authentication authentication) {
        userService.changeEmail(authentication.getName(), request.getNewEmail(), request.getCurrentPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/username")
    public ResponseEntity<AuthResponse> changeUsername(@Valid @RequestBody ChangeUsernameRequest request,
                                                        Authentication authentication) {
        AuthResponse response = userService.changeUsername(authentication.getName(), request.getNewUsername(), request.getCurrentPassword());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountRequest request,
                                              Authentication authentication) {
        userService.deleteOwnAccount(authentication.getName(), request.getCurrentPassword());
        return ResponseEntity.noContent().build();
    }
}