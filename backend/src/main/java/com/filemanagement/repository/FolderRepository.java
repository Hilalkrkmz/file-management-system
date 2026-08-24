package com.filemanagement.repository;

import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByOwnerAndParentFolderAndIsDeletedFalse(User owner, Folder parentFolder);

    List<Folder> findByParentFolderAndIsDeletedFalse(Folder parentFolder);

    List<Folder> findByParentFolder(Folder parentFolder);

    List<Folder> findByOwnerAndParentFolderIsNullAndIsDeletedFalse(User owner);

    List<Folder> findByOwnerAndParentFolderIsNull(User owner);

    Optional<Folder> findByOwnerAndParentFolderAndNameAndIsDeletedFalse(User owner, Folder parentFolder, String name);

    List<Folder> findByOwnerAndIsDeletedTrue(User owner);

    List<Folder> findByOwnerAndNameContainingIgnoreCaseAndIsDeletedFalse(User owner, String name);
}