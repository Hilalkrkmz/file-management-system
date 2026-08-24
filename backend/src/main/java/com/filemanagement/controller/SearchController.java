package com.filemanagement.controller;

import com.filemanagement.dto.SearchResultResponse;
import com.filemanagement.service.FileService;
import com.filemanagement.service.FolderService;
import com.filemanagement.service.ShareService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final FileService fileService;
    private final FolderService folderService;
    private final ShareService shareService;

    public SearchController(FileService fileService, FolderService folderService, ShareService shareService) {
        this.fileService = fileService;
        this.folderService = folderService;
        this.shareService = shareService;
    }

    @GetMapping
    public ResponseEntity<SearchResultResponse> search(@RequestParam String query, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(new SearchResultResponse(
                fileService.search(username, query),
                folderService.search(username, query),
                shareService.searchSharedFiles(username, query),
                shareService.searchSharedFolders(username, query)
        ));
    }
}
