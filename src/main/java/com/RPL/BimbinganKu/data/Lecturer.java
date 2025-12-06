package com.RPL.BimbinganKu.data;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "lecturers")
@PrimaryKeyJoinColumn(name = "lecturer_code")
public class Lecturer extends User {

    public Lecturer(String email, String password, String name, String code) {
        // FIX: Must match User(id, email, password, name)
        super(code, email, password, name);
    }

    public Lecturer(User user, String code) {
        super(user);
        this.setId(code);
    }

    public String getLecturerCode() {
        return this.getId();
    }
    
    public void setLecturerCode(String code) {
        this.setId(code);
    }
}