package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

import lombok.EqualsAndHashCode;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Lecturer extends User {
    @NotBlank
    @Size(max = 50)
    private String lecturerCode;

    public Lecturer(String email, String password, String name, String code) {
        super(code, email, password, name);
        this.lecturerCode = code;
    }

    public Lecturer(User user, String code) {
        super(user);
        this.lecturerCode = code;
    }
}