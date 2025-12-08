package com.RPL.BimbinganKu.data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @NotBlank
    @Size(max = 10)
    private String id;

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @NotBlank
    @Size(max = 255)
    private String name;

    public User(User user) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.password = user.password;
    }
}