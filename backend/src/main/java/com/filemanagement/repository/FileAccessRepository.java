package com.filemanagement.repository;

import com.filemanagement.entity.File;
import com.filemanagement.entity.FileAccess;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileAccessRepository extends JpaRepository<FileAccess, UUID> {

    Optional<FileAccess> findByUserAndFile(User user, File file);

    List<FileAccess> findByUserOrderByAccessedAtDesc(User user);

    List<FileAccess> findByFile(File file);
}
