package com.RPL.BimbinganKu.data;

import jakarta.persistence.Column;
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
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "npm")
public class Student extends User {

    @Column(name = "total_guidanceuts")
    private int totalGuidanceUTS;

    @Column(name = "total_guidanceuas")
    private int totalGuidanceUAS;

    // Constructor matching CsvImportService call
    public Student(String email, String password, String name, String npm, int uasGuidance, int utsGuidance) {
        // FIX: Must match User(id, email, password, name)
        super(npm, email, password, name); 
        
        this.totalGuidanceUAS = uasGuidance;
        this.totalGuidanceUTS = utsGuidance;
    }

    public Student(User user, String npm, int uasGuidance, int utsGuidance) {
        super(user);
        this.setId(npm);
        this.totalGuidanceUAS = uasGuidance;
        this.totalGuidanceUTS = utsGuidance;
    }
    
    public String getNpm() {
        return this.getId();
    }
    
    public void setNpm(String npm) {
        this.setId(npm);
    }
}