package com.RPL.BimbinganKu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.Akademik;

import java.util.Optional;

@Repository
public interface AkademikRepository extends JpaRepository<Akademik, Integer> {

    // Fetch the latest entry (highest ID) as the "Current" academic year
    @Query(value = "SELECT * FROM Akademik ORDER BY akademik_ID DESC LIMIT 1", nativeQuery = true)
    Optional<Akademik> findCurrentAkademik();
}
