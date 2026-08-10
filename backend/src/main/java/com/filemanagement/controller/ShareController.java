package com.filemanagement.controller;

import com.filemanagement.dto.*;
import com.filemanagement.entity.File;
import com.filemanagement.service.FileStorageService;
import com.filemanagement.service.ShareService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final ShareService shareService;
    private final FileStorageService storageService;

    public ShareController(ShareService shareService, FileStorageService storageService) {
        this.shareService = shareService;
        this.storageService = storageService;
    }

    @PostMapping("/user")
    public ResponseEntity<FileShareResponse> shareWithUser(@Valid @RequestBody ShareWithUserRequest request,
                                                           Authentication authentication) {
        return ResponseEntity.ok(shareService.shareWithUser(authentication.getName(), request));
    }

    @GetMapping("/with-me")
    public ResponseEntity<List<FileShareResponse>> sharedWithMe(Authentication authentication) {
        return ResponseEntity.ok(shareService.listSharedWithMe(authentication.getName()));
    }

    @PostMapping("/link")
    public ResponseEntity<ShareLinkResponse> createLink(@Valid @RequestBody CreateShareLinkRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(shareService.createShareLink(authentication.getName(), request));
    }

    @GetMapping("/public/{token}")
    public ResponseEntity<ByteArrayResource> downloadPublic(@PathVariable String token) {
        File file = shareService.getFileByToken(token);
        byte[] data = shareService.downloadViaLink(token, storageService);

        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.getName()).build().toString())
                .contentLength(data.length)
                .body(resource);
    }
}