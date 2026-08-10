package com.filemanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateQuotaRequest {

    @NotNull
    @Min(1)
    private Long quotaMb;
}