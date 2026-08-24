package com.filemanagement.repository;

import com.filemanagement.entity.Folder;
import com.filemanagement.entity.FolderShare;
import com.filemanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FolderShareRepository extends JpaRepository<FolderShare, UUID> {

    List<FolderShare> findBySharedWith(User sharedWith);

    List<FolderShare> findByFolder(Folder folder);

    boolean existsByFolderAndSharedWith(Folder folder, User sharedWith);
}
