package com.filemanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.storage.location}")
    private String storageLocation;

    @Override
    public String store(MultipartFile file, String storageKey) {
        try {
            Path targetDir = Paths.get(storageLocation);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(storageKey);
            Files.copy(file.getInputStream(), targetPath);

            return targetPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Dosya kaydedilemedi: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] load(String storagePath) {
        try {
            return Files.readAllBytes(Paths.get(storagePath));
        } catch (IOException e) {
            throw new RuntimeException("Dosya okunamadi: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storagePath) {
        try {
            Files.deleteIfExists(Paths.get(storagePath));
        } catch (IOException e) {
            throw new RuntimeException("Dosya silinemedi: " + e.getMessage(), e);
        }
    }
}