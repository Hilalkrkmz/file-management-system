package com.filemanagement.service;

import com.filemanagement.dto.FileResponse;
import com.filemanagement.dto.StorageInfoResponse;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FileShareRepository;
import com.filemanagement.repository.FolderRepository;
import com.filemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final FileStorageService storageService;
    private final FileShareRepository fileShareRepository;

    @Value("${app.storage.max-file-size-mb}")
    private long maxFileSizeMb;

    @Value("${app.storage.allowed-extensions}")
    private String allowedExtensionsRaw;

    private static final Map<String, String> EXTENSION_MIME_MAP = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("txt", "text/plain"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"),
            Map.entry("zip", "application/zip"),
            Map.entry("rar", "application/x-rar-compressed")
    );

    public FileService(FileRepository fileRepository, FolderRepository folderRepository,
                       UserRepository userRepository, FileStorageService storageService,FileShareRepository fileShareRepository) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.fileShareRepository = fileShareRepository;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanici bulunamadi"));
    }

    private Set<String> allowedExtensions() {
        return Arrays.stream(allowedExtensionsRaw.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    public FileResponse uploadFile(String username, UUID folderId, MultipartFile multipartFile) {
        User owner = getUser(username);

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasore erisim yetkiniz yok");
        }

        String originalName = multipartFile.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("Gecersiz dosya adi");
        }

        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!allowedExtensions().contains(extension)) {
            throw new IllegalArgumentException("Desteklenmeyen dosya uzantisi: " + extension);
        }

        String declaredContentType = multipartFile.getContentType();
        String expectedMimeType = EXTENSION_MIME_MAP.get(extension);

        if (expectedMimeType != null && declaredContentType != null
                && !declaredContentType.equals(expectedMimeType)
                && !declaredContentType.equals("application/octet-stream")) {
            throw new IllegalArgumentException(
                    "Dosya icerigi uzantisiyla uyusmuyor (beklenen: " + expectedMimeType
                            + ", gelen: " + declaredContentType + ")");
        }

        long maxBytes = maxFileSizeMb * 1024 * 1024;
        if (multipartFile.getSize() > maxBytes) {
            throw new IllegalArgumentException("Dosya boyutu " + maxFileSizeMb + "MB limitini asiyor");
        }

        long currentUsedBytes = fileRepository.sumSizeByOwner(owner);
        long quotaBytes = owner.getStorageQuotaMb() * 1024 * 1024;
        if (currentUsedBytes + multipartFile.getSize() > quotaBytes) {
            throw new IllegalArgumentException("Depolama kotanizi asiyorsunuz (kota: "
                    + owner.getStorageQuotaMb() + "MB)");
        }

        String finalName = resolveUniqueName(folder, originalName);

        String storageKey = UUID.randomUUID() + "_" + finalName;
        String storagePath = storageService.store(multipartFile, storageKey);

        com.filemanagement.entity.File file = new com.filemanagement.entity.File();
        file.setName(finalName);
        file.setExtension(extension);
        file.setSize(multipartFile.getSize());
        file.setStoragePath(storagePath);
        file.setFolder(folder);
        file.setOwner(owner);

        fileRepository.save(file);
        return toResponse(file);
    }

    private String resolveUniqueName(Folder folder, String originalName) {
        String base = originalName;
        String ext = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex != -1) {
            base = originalName.substring(0, dotIndex);
            ext = originalName.substring(dotIndex);
        }

        String candidate = originalName;
        int counter = 1;
        while (fileRepository.findByFolderAndNameAndIsDeletedFalse(folder, candidate).isPresent()) {
            candidate = base + "(" + counter + ")" + ext;
            counter++;
        }
        return candidate;
    }

    public List<FileResponse> listFiles(String username, UUID folderId) {
        User owner = getUser(username);

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasor bulunamadi"));

        if (!folder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu klasore erisim yetkiniz yok");
        }

        return fileRepository.findByFolderAndIsDeletedFalse(folder)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public byte[] downloadFile(String username, UUID fileId) {
        User user = getUser(username);
        com.filemanagement.entity.File file = getOwnedOrSharedFile(user, fileId);
        return storageService.load(file.getStoragePath());
    }

    public com.filemanagement.entity.File getFileEntity(String username, UUID fileId) {
        User user = getUser(username);
        return getOwnedOrSharedFile(user, fileId);
    }

    private com.filemanagement.entity.File getOwnedOrSharedFile(User user, UUID fileId) {
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));

        boolean isOwner = file.getOwner().getId().equals(user.getId());
        boolean isSharedWithUser = fileShareRepository.existsByFileAndSharedWith(file, user);

        if (!isOwner && !isSharedWithUser) {
            throw new IllegalArgumentException("Bu dosyaya erisim yetkiniz yok");
        }
        return file;
    }

    public void deleteFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayi silme yetkiniz yok");
        }

        file.setDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        fileRepository.save(file);
    }

    public FileResponse moveFile(String username, UUID fileId, UUID targetFolderId) {
        User owner = getUser(username);

        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayi tasima yetkiniz yok");
        }

        Folder targetFolder = folderRepository.findById(targetFolderId)
                .orElseThrow(() -> new IllegalArgumentException("Hedef klasor bulunamadi"));
        if (!targetFolder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Hedef klasore erisim yetkiniz yok");
        }

        file.setFolder(targetFolder);
        fileRepository.save(file);
        return toResponse(file);
    }

    public List<FileResponse> search(String username, String query) {
        User owner = getUser(username);
        return fileRepository.findByOwnerAndNameContainingIgnoreCaseAndIsDeletedFalse(owner, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private FileResponse toResponse(com.filemanagement.entity.File file) {
        return new FileResponse(
                file.getId(),
                file.getName(),
                file.getExtension(),
                file.getSize(),
                file.getFolder().getId(),
                file.getUploadedAt()
        );
    }

    public StorageInfoResponse getStorageInfo(String username) {
        User owner = getUser(username);
        long usedBytes = fileRepository.sumSizeByOwner(owner);
        long fileCount = fileRepository.countByOwnerAndIsDeletedFalse(owner);
        double usedMb = usedBytes / (1024.0 * 1024.0);
        double remainingMb = owner.getStorageQuotaMb() - usedMb;

        return new StorageInfoResponse(
                usedBytes,
                Math.round(usedMb * 100.0) / 100.0,
                fileCount,
                owner.getStorageQuotaMb(),
                Math.round(remainingMb * 100.0) / 100.0
        );
    }

    public List<FileResponse> listTrash(String username) {
        User owner = getUser(username);
        return fileRepository.findByOwnerAndIsDeletedTrue(owner)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void restoreFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayi geri yukleme yetkiniz yok");
        }

        file.setDeleted(false);
        file.setDeletedAt(null);
        fileRepository.save(file);
    }

    public FileResponse renameFile(String username, UUID fileId, String newName) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayi yeniden adlandirma yetkiniz yok");
        }

        file.setName(newName);
        fileRepository.save(file);
        return toResponse(file);
    }

    public void permanentlyDeleteFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadi"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayi silme yetkiniz yok");
        }

        storageService.delete(file.getStoragePath());
        fileRepository.delete(file);
    }
}