package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchResultResponse {
    private List<FileResponse> ownFiles;
    private List<FolderResponse> ownFolders;
    private List<FileShareResponse> sharedFiles;
    private List<FolderShareResponse> sharedFolders;
}
