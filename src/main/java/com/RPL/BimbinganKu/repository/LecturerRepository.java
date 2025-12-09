package com.RPL.BimbinganKu.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import static java.util.Optional.empty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.User;

@Repository
public class LecturerRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private UserRepository userRepo;

    public void save(Lecturer lecturer) throws Exception {
        // Fix: Use setters to ensure correct data mapping
        User newUser = new User();
        newUser.setId(lecturer.getId());
        newUser.setEmail(lecturer.getEmail());
        newUser.setPassword(lecturer.getPassword());
        newUser.setName(lecturer.getName());
        
        // Save the generic User data first
        userRepo.save(newUser);

        // Fix: Only pass 1 argument to the query. 
        // We use getId() because lecturerCode IS the ID in this schema.
        String sql = "INSERT INTO Lecturers (lecturerCode) VALUES (?)";
        jdbcTemplate.update(sql, lecturer.getId());
    }

    public Optional<Lecturer> findByLecturerCode(String code) {
        String sql = """
            SELECT u.email, u.password, u.name, l.lecturerCode 
            FROM Lecturers l 
            JOIN Users u ON u.id = l.lecturerCode 
            WHERE l.lecturerCode = ?
        """;
        List<Lecturer> results = jdbcTemplate.query(sql, this::mapRowToLecturer, code);
        return results.isEmpty() ? empty() : Optional.of(results.get(0));
    }

    public List<Lecturer> findAll() {
        String sql = """
            SELECT u.email, u.password, u.name, l.lecturerCode 
            FROM Lecturers l 
            JOIN Users u ON l.lecturerCode = u.id
        """;
        return jdbcTemplate.query(sql, this::mapRowToLecturer);
    }

    private Lecturer mapRowToLecturer(ResultSet resultSet, int rowNum) throws SQLException {
        // Matches constructor: Lecturer(email, password, name, code)
        return new Lecturer(
                resultSet.getString("email"),
                resultSet.getString("password"),
                resultSet.getString("name"),
                resultSet.getString("lecturerCode")
        );
    }
}