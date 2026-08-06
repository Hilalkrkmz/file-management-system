package com.filemanagement.repository;

import com.filemanagement.entity.File;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {

    List<File> findByFolderAndIsDeletedFalse(Folder folder);

    List<File> findByOwnerAndIsDeletedFalse(User owner);

    List<File> findByOwnerAndNameContainingIgnoreCaseAndIsDeletedFalse(User owner, String name);

    Optional<File> findByFolderAndNameAndIsDeletedFalse(Folder folder, String name);

    List<File> findByOwnerAndIsDeletedTrue(User owner);
}