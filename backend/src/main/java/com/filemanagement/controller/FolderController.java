package com.filemanagement.controller;

import com.filemanagement.dto.FolderRequest;
import com.filemanagement.dto.FolderResponse;
import com.filemanagement.service.FolderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    public ResponseEntity<FolderResponse> create(@Valid @RequestBody FolderRequest request,
                                                 Authentication authentication) {
        return ResponseEntity.ok(folderService.createFolder(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> list(@RequestParam(required = false) UUID parentId,
                                                     Authentication authentication) {
        return ResponseEntity.ok(folderService.listFolders(authentication.getName(), parentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        folderService.deleteFolder(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trash")
    public ResponseEntity<List<FolderResponse>> trash(Authentication authentication) {
        return ResponseEntity.ok(folderService.listTrash(authentication.getName()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable UUID id, Authentication authentication) {
        folderService.restoreFolder(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}