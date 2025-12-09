package com.RPL.BimbinganKu.data;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @Size(max = 50)
    @Column(length = 50)
    private String id;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    // MANUAL CONSTRUCTOR: Forces correct order (ID, Email, Password, Name)
    public User(String id, String email, String password, String name) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    // Copy constructor
    public User(User user) {
        this.id = user.id;
        this.email = user.email;
        this.name = user.name;
        this.password = user.password;
    }
}