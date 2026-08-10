package com.filemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StorageInfoResponse {
    private long usedBytes;
    private double usedMb;
    private long fileCount;
    private long quotaMb;
    private double remainingMb;
}