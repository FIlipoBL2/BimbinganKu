package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Student extends User {
    @NotBlank
    @Size(min = 10, max = 10)
    private String npm;

    private int totalGuidanceUTS;
    private int totalGuidanceUAS;

    public Student(String email, String password, String name, String npm, int uasGuidance, int utsGuidance) {
        super(npm, email, password, name);
        this.npm = npm;
        this.totalGuidanceUAS = uasGuidance;
        this.totalGuidanceUTS = utsGuidance;
    }

    public Student(User user, String npm, int uasGuidance, int utsGuidance) {
        super(user);
        this.npm = npm;
        this.totalGuidanceUAS = uasGuidance;
        this.totalGuidanceUTS = utsGuidance;
    }
}
