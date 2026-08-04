package com.filemanagement.repository;

import com.filemanagement.entity.File;
import com.filemanagement.entity.FileShare;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FileShareRepository extends JpaRepository<FileShare, UUID> {

    List<FileShare> findBySharedWith(User sharedWith);

    List<FileShare> findByFile(File file);

    boolean existsByFileAndSharedWith(File file, User sharedWith);
}