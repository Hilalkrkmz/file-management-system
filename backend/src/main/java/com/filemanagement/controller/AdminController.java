package com.filemanagement.controller;

import com.filemanagement.dto.AdminFileResponse;
import com.filemanagement.dto.UpdateQuotaRequest;
import com.filemanagement.dto.UserResponse;
import com.filemanagement.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/files")
    public ResponseEntity<List<AdminFileResponse>> listAllFiles() {
        return ResponseEntity.ok(adminService.listAllFiles());
    }

    @DeleteMapping("/files/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID id) {
        adminService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/folders/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable UUID id) {
        adminService.deleteFolder(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/quota")
    public ResponseEntity<UserResponse> updateQuota(@PathVariable UUID id,
                                                    @Valid @RequestBody UpdateQuotaRequest request) {
        return ResponseEntity.ok(adminService.updateQuota(id, request.getQuotaMb()));
    }
}