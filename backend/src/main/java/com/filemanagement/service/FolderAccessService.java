package com.filemanagement.service;

import com.filemanagement.entity.Folder;
import com.filemanagement.entity.User;
import com.filemanagement.repository.FolderShareRepository;
import org.springframework.stereotype.Service;

@Service
public class FolderAccessService {

    private final FolderShareRepository folderShareRepository;

    public FolderAccessService(FolderShareRepository folderShareRepository) {
        this.folderShareRepository = folderShareRepository;
    }

    public boolean hasAccess(Folder folder, User user) {
        if (folder.getOwner().getId().equals(user.getId())) {
            return true;
        }
        if (folderShareRepository.existsByFolderAndSharedWith(folder, user)) {
            return true;
        }
        if (folder.getParentFolder() != null) {
            return hasAccess(folder.getParentFolder(), user);
        }
        return false;
    }
}
