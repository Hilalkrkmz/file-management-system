package com.filemanagement.controller;

import com.filemanagement.dto.FileResponse;
import com.filemanagement.dto.RenameRequest;
import com.filemanagement.dto.StorageInfoResponse;
import com.filemanagement.service.FileService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileResponse> upload(@RequestParam UUID folderId,
                                               @RequestParam("file") MultipartFile file,
                                               Authentication authentication) {
        return ResponseEntity.ok(fileService.uploadFile(authentication.getName(), folderId, file));
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> list(@RequestParam UUID folderId,
                                                   Authentication authentication) {
        return ResponseEntity.ok(fileService.listFiles(authentication.getName(), folderId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> download(@PathVariable UUID id,
                                                      Authentication authentication) {
        var fileEntity = fileService.getFileEntity(authentication.getName(), id);
        byte[] data = fileService.downloadFile(authentication.getName(), id);

        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileEntity.getName()).build().toString())
                .contentLength(data.length)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        fileService.deleteFile(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<FileResponse> move(@PathVariable UUID id,
                                             @RequestParam UUID targetFolderId,
                                             Authentication authentication) {
        return ResponseEntity.ok(fileService.moveFile(authentication.getName(), id, targetFolderId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileResponse>> search(@RequestParam String query,
                                                     Authentication authentication) {
        return ResponseEntity.ok(fileService.search(authentication.getName(), query));
    }

    @GetMapping("/storage-usage")
    public ResponseEntity<StorageInfoResponse> storageUsage(Authentication authentication) {
        return ResponseEntity.ok(fileService.getStorageInfo(authentication.getName()));
    }

    @GetMapping("/trash")
    public ResponseEntity<List<FileResponse>> trash(Authentication authentication) {
        return ResponseEntity.ok(fileService.listTrash(authentication.getName()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable UUID id, Authentication authentication) {
        fileService.restoreFile(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FileResponse> rename(@PathVariable UUID id,
                                               @Valid @RequestBody RenameRequest request,
                                               Authentication authentication) {
        return ResponseEntity.ok(fileService.renameFile(authentication.getName(), id, request.getName()));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentDelete(@PathVariable UUID id, Authentication authentication) {
        fileService.permanentlyDeleteFile(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent")
    public ResponseEntity<List<FileResponse>> recent(Authentication authentication) {
        return ResponseEntity.ok(fileService.listRecent(authentication.getName()));
    }

    @PostMapping("/{id}/star")
    public ResponseEntity<FileResponse> toggleStar(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(fileService.toggleStar(authentication.getName(), id));
    }

    @GetMapping("/starred")
    public ResponseEntity<List<FileResponse>> starred(Authentication authentication) {
        return ResponseEntity.ok(fileService.listStarred(authentication.getName()));
    }
}