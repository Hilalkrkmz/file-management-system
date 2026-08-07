package com.filemanagement.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String store(MultipartFile file, String storageKey);
    byte[] load(String storagePath);
    void delete(String storagePath);
}
