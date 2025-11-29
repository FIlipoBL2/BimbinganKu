package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student extends User {
    @NotBlank
    @Size(min = 10, max = 10)
    private String npm;

    private int totalGuidanceUTS;
    private int totalGuidanceUAS;
}
