package com.RPL.BimbinganKu.data;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@Entity
@Table(name = "Akademik")
public class Akademik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "akademik_ID")
    private int id;

    @Column(nullable = false)
    private String year;

    @Column(nullable = false)
    private String semester;

    @Column(name = "semester_start")
    private LocalDate semesterStart;

    @Column(name = "uts_deadline")
    private LocalDate utsDeadline;

    @Column(name = "uas_deadline")
    private LocalDate uasDeadline;
}
