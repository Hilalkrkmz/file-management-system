package com.filemanagement.controller;

import com.filemanagement.dto.UserProfileResponse;
import com.filemanagement.service.UserService;
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
}