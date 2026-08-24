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
import java.util.UUID;

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

    @GetMapping("/file/{fileId}")
    public ResponseEntity<List<FileShareResponse>> sharesForFile(@PathVariable UUID fileId,
                                                                 Authentication authentication) {
        return ResponseEntity.ok(shareService.listSharesForFile(authentication.getName(), fileId));
    }

    @DeleteMapping("/{shareId}")
    public ResponseEntity<Void> removeShare(@PathVariable UUID shareId, Authentication authentication) {
        shareService.removeShare(authentication.getName(), shareId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/folder")
    public ResponseEntity<FolderShareResponse> shareFolderWithUser(@Valid @RequestBody ShareFolderRequest request,
                                                                    Authentication authentication) {
        return ResponseEntity.ok(shareService.shareFolderWithUser(authentication.getName(), request));
    }

    @GetMapping("/folders-with-me")
    public ResponseEntity<List<FolderShareResponse>> foldersSharedWithMe(Authentication authentication) {
        return ResponseEntity.ok(shareService.listFoldersSharedWithMe(authentication.getName()));
    }

    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<FolderShareResponse>> sharesForFolder(@PathVariable UUID folderId,
                                                                      Authentication authentication) {
        return ResponseEntity.ok(shareService.listSharesForFolder(authentication.getName(), folderId));
    }

    @DeleteMapping("/folder/{shareId}")
    public ResponseEntity<Void> removeFolderShare(@PathVariable UUID shareId, Authentication authentication) {
        shareService.removeFolderShare(authentication.getName(), shareId);
        return ResponseEntity.noContent().build();
    }
}