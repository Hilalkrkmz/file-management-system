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
            Path baseDir = Paths.get(storageLocation).toAbsolutePath().normalize();
            Files.createDirectories(baseDir);

            Path targetPath = baseDir.resolve(storageKey).normalize();

            if (!targetPath.startsWith(baseDir)) {
                throw new SecurityException("Geçersiz dosya yolu tespit edildi");
            }

            Files.copy(file.getInputStream(), targetPath);
            return targetPath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Dosya kaydedilemedi: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] load(String storagePath) {
        try {
            Path baseDir = Paths.get(storageLocation).toAbsolutePath().normalize();
            Path target = Paths.get(storagePath).toAbsolutePath().normalize();

            if (!target.startsWith(baseDir)) {
                throw new SecurityException("Geçersiz dosya yolu tespit edildi");
            }

            return Files.readAllBytes(target);
        } catch (IOException e) {
            throw new RuntimeException("Dosya okunamadı: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storagePath) {
        try {
            Path baseDir = Paths.get(storageLocation).toAbsolutePath().normalize();
            Path target = Paths.get(storagePath).toAbsolutePath().normalize();

            if (!target.startsWith(baseDir)) {
                throw new SecurityException("Geçersiz dosya yolu tespit edildi");
            }

            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException("Dosya silinemedi: " + e.getMessage(), e);
        }
    }
}