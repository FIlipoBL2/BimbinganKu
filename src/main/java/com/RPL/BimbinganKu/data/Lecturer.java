package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Lecturer extends User {
    @NotBlank
    @Size(max = 50)
    private String lecturerCode;
}
