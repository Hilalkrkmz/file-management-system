package com.filemanagement.repository;

import com.filemanagement.entity.File;
import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FileRepository extends JpaRepository<File, UUID> {

    List<File> findByFolderAndIsDeletedFalse(Folder folder);

    List<File> findByFolder(Folder folder);

    List<File> findByOwner(User owner);

    List<File> findByOwnerAndFolderIsNullAndIsDeletedFalse(User owner);

    List<File> findByOwnerAndIsDeletedFalse(User owner);

    List<File> findByOwnerAndNameContainingIgnoreCaseAndIsDeletedFalse(User owner, String name);

    Optional<File> findByFolderAndNameAndIsDeletedFalse(Folder folder, String name);

    Optional<File> findByOwnerAndFolderIsNullAndNameAndIsDeletedFalse(User owner, String name);

    List<File> findByOwnerAndIsDeletedTrue(User owner);

    @Query("SELECT COALESCE(SUM(f.size), 0) FROM File f WHERE f.owner = :owner AND f.isDeleted = false")
    long sumSizeByOwner(@Param("owner") User owner);

    long countByOwnerAndIsDeletedFalse(User owner);
}