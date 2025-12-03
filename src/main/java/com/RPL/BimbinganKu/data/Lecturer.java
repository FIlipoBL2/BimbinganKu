package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Lecturer extends User {
    @NotBlank
    @Size(max = 50)
    private String lecturerCode;

    public Lecturer(String email, String password, String name, String code) {
        super(email, password, name);
        this.lecturerCode = code;
    }
}
