package com.filemanagement.service;

import com.filemanagement.dto.FileResponse;
import com.filemanagement.dto.StorageInfoResponse;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import com.filemanagement.entity.FileAccess;
import com.filemanagement.entity.FileStar;
import com.filemanagement.repository.FileAccessRepository;
import com.filemanagement.repository.FileRepository;
import com.filemanagement.repository.FileShareRepository;
import com.filemanagement.repository.FileStarRepository;
import com.filemanagement.repository.FolderRepository;
import com.filemanagement.repository.ShareLinkRepository;
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
    private final ShareLinkRepository shareLinkRepository;
    private final FolderAccessService folderAccessService;
    private final FileAccessRepository fileAccessRepository;
    private final FileStarRepository fileStarRepository;

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
                       UserRepository userRepository, FileStorageService storageService,FileShareRepository fileShareRepository,
                       ShareLinkRepository shareLinkRepository, FolderAccessService folderAccessService,
                       FileAccessRepository fileAccessRepository, FileStarRepository fileStarRepository) {
        this.fileRepository = fileRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.fileShareRepository = fileShareRepository;
        this.shareLinkRepository = shareLinkRepository;
        this.folderAccessService = folderAccessService;
        this.fileAccessRepository = fileAccessRepository;
        this.fileStarRepository = fileStarRepository;
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı"));
    }

    private Set<String> allowedExtensions() {
        return Arrays.stream(allowedExtensionsRaw.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    public FileResponse uploadFile(String username, UUID folderId, MultipartFile multipartFile) {
        User owner = getUser(username);

        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new IllegalArgumentException("Klasör bulunamadı"));

            if (!folder.getOwner().getId().equals(owner.getId())) {
                throw new IllegalArgumentException("Bu klasöre erişim yetkiniz yok");
            }
        }

        String originalName = multipartFile.getOriginalFilename();
        if (originalName != null) {
            int lastSeparator = Math.max(originalName.lastIndexOf('/'), originalName.lastIndexOf('\\'));
            if (lastSeparator != -1) {
                originalName = originalName.substring(lastSeparator + 1);
            }
        }
        if (originalName == null || originalName.isBlank() || !originalName.contains(".")) {
            throw new IllegalArgumentException("Geçersiz dosya adı");
        }

        String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase();
        if (!allowedExtensions().contains(extension)) {
            throw new IllegalArgumentException("Desteklenmeyen dosya uzantısı: " + extension);
        }

        String declaredContentType = multipartFile.getContentType();
        String expectedMimeType = EXTENSION_MIME_MAP.get(extension);

        if (expectedMimeType != null && declaredContentType != null
                && !declaredContentType.equals(expectedMimeType)
                && !declaredContentType.equals("application/octet-stream")) {
            throw new IllegalArgumentException(
                    "Dosya içeriği uzantısıyla uyuşmuyor (beklenen: " + expectedMimeType
                            + ", gelen: " + declaredContentType + ")");
        }

        long maxBytes = maxFileSizeMb * 1024 * 1024;
        if (multipartFile.getSize() > maxBytes) {
            throw new IllegalArgumentException("Dosya boyutu " + maxFileSizeMb + "MB limitini aşıyor");
        }

        long currentUsedBytes = fileRepository.sumSizeByOwner(owner);
        long quotaBytes = owner.getStorageQuotaMb() * 1024 * 1024;
        if (currentUsedBytes + multipartFile.getSize() > quotaBytes) {
            throw new IllegalArgumentException("Depolama kotanızı aşıyorsunuz (kota: "
                    + owner.getStorageQuotaMb() + "MB)");
        }

        String finalName = resolveUniqueName(owner, folder, originalName);

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
        return toResponse(file, owner);
    }

    private String resolveUniqueName(User owner, Folder folder, String originalName) {
        String base = originalName;
        String ext = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex != -1) {
            base = originalName.substring(0, dotIndex);
            ext = originalName.substring(dotIndex);
        }

        String candidate = originalName;
        int counter = 1;
        while (nameExists(owner, folder, candidate)) {
            candidate = base + "(" + counter + ")" + ext;
            counter++;
        }
        return candidate;
    }

    private boolean nameExists(User owner, Folder folder, String name) {
        if (folder != null) {
            return fileRepository.findByFolderAndNameAndIsDeletedFalse(folder, name).isPresent();
        }
        return fileRepository.findByOwnerAndFolderIsNullAndNameAndIsDeletedFalse(owner, name).isPresent();
    }

    public List<FileResponse> listFiles(String username, UUID folderId) {
        User owner = getUser(username);

        if (folderId == null) {
            return fileRepository.findByOwnerAndFolderIsNullAndIsDeletedFalse(owner)
                    .stream().map(f -> toResponse(f, owner)).collect(Collectors.toList());
        }

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Klasör bulunamadı"));

        if (!folderAccessService.hasAccess(folder, owner)) {
            throw new IllegalArgumentException("Bu klasöre erişim yetkiniz yok");
        }

        return fileRepository.findByFolderAndIsDeletedFalse(folder)
                .stream().map(f -> toResponse(f, owner)).collect(Collectors.toList());
    }

    public byte[] downloadFile(String username, UUID fileId) {
        User user = getUser(username);
        com.filemanagement.entity.File file = getOwnedOrSharedFile(user, fileId);
        recordAccess(user, file);
        return storageService.load(file.getStoragePath());
    }

    private void recordAccess(User user, com.filemanagement.entity.File file) {
        FileAccess access = fileAccessRepository.findByUserAndFile(user, file).orElseGet(() -> {
            FileAccess a = new FileAccess();
            a.setUser(user);
            a.setFile(file);
            return a;
        });
        access.setAccessedAt(LocalDateTime.now());
        fileAccessRepository.save(access);
    }

    public com.filemanagement.entity.File getFileEntity(String username, UUID fileId) {
        User user = getUser(username);
        return getOwnedOrSharedFile(user, fileId);
    }

    private com.filemanagement.entity.File getOwnedOrSharedFile(User user, UUID fileId) {
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));

        boolean isOwner = file.getOwner().getId().equals(user.getId());
        boolean isSharedWithUser = fileShareRepository.existsByFileAndSharedWith(file, user);
        boolean isViaSharedFolder = file.getFolder() != null && folderAccessService.hasAccess(file.getFolder(), user);

        if (!isOwner && !isSharedWithUser && !isViaSharedFolder) {
            throw new IllegalArgumentException("Bu dosyaya erişim yetkiniz yok");
        }
        return file;
    }

    public void deleteFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayı silme yetkiniz yok");
        }

        file.setDeleted(true);
        file.setDeletedAt(LocalDateTime.now());
        fileRepository.save(file);
    }

    public FileResponse moveFile(String username, UUID fileId, UUID targetFolderId) {
        User owner = getUser(username);

        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));
        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayı taşıma yetkiniz yok");
        }

        Folder targetFolder = folderRepository.findById(targetFolderId)
                .orElseThrow(() -> new IllegalArgumentException("Hedef klasör bulunamadı"));
        if (!targetFolder.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Hedef klasöre erişim yetkiniz yok");
        }

        file.setFolder(targetFolder);
        fileRepository.save(file);
        return toResponse(file, owner);
    }

    public List<FileResponse> search(String username, String query) {
        User owner = getUser(username);
        return fileRepository.findByOwnerAndNameContainingIgnoreCaseAndIsDeletedFalse(owner, query)
                .stream().map(f -> toResponse(f, owner)).collect(Collectors.toList());
    }

    private FileResponse toResponse(com.filemanagement.entity.File file, User currentUser) {
        return toResponse(file, null, currentUser);
    }

    private FileResponse toResponse(com.filemanagement.entity.File file, LocalDateTime accessedAt, User currentUser) {
        Folder folder = file.getFolder();
        boolean starred = fileStarRepository.findByUserAndFile(currentUser, file).isPresent();
        return new FileResponse(
                file.getId(),
                file.getName(),
                file.getExtension(),
                file.getSize(),
                folder != null ? folder.getId() : null,
                folder != null ? folder.getName() : "Ana Dizin",
                file.getUploadedAt(),
                accessedAt,
                starred
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
                .stream().map(f -> toResponse(f, owner)).collect(Collectors.toList());
    }

    public void restoreFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayı geri yükleme yetkiniz yok");
        }

        file.setDeleted(false);
        file.setDeletedAt(null);
        fileRepository.save(file);
    }

    public FileResponse renameFile(String username, UUID fileId, String newName) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayı yeniden adlandırma yetkiniz yok");
        }

        file.setName(newName);
        fileRepository.save(file);
        return toResponse(file, owner);
    }

    public void permanentlyDeleteFile(String username, UUID fileId) {
        User owner = getUser(username);
        com.filemanagement.entity.File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Dosya bulunamadı"));

        if (!file.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Bu dosyayı silme yetkiniz yok");
        }

        purgeFile(file);
    }

    public void purgeFile(com.filemanagement.entity.File file) {
        fileShareRepository.deleteAll(fileShareRepository.findByFile(file));
        shareLinkRepository.deleteAll(shareLinkRepository.findByFile(file));
        fileAccessRepository.deleteAll(fileAccessRepository.findByFile(file));
        fileStarRepository.deleteAll(fileStarRepository.findByFile(file));
        storageService.delete(file.getStoragePath());
        fileRepository.delete(file);
    }

    public List<FileResponse> listRecent(String username) {
        User user = getUser(username);
        return fileAccessRepository.findByUserOrderByAccessedAtDesc(user).stream()
                .filter(a -> !a.getFile().isDeleted())
                .limit(10)
                .map(a -> toResponse(a.getFile(), a.getAccessedAt(), user))
                .collect(Collectors.toList());
    }

    public FileResponse toggleStar(String username, UUID fileId) {
        User user = getUser(username);
        com.filemanagement.entity.File file = getOwnedOrSharedFile(user, fileId);

        fileStarRepository.findByUserAndFile(user, file).ifPresentOrElse(
                fileStarRepository::delete,
                () -> {
                    FileStar star = new FileStar();
                    star.setUser(user);
                    star.setFile(file);
                    fileStarRepository.save(star);
                }
        );
        return toResponse(file, user);
    }

    public List<FileResponse> listStarred(String username) {
        User user = getUser(username);
        return fileStarRepository.findByUser(user).stream()
                .map(FileStar::getFile)
                .filter(f -> !f.isDeleted())
                .map(f -> toResponse(f, user))
                .collect(Collectors.toList());
    }

}