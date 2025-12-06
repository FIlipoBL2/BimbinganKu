package com.RPL.BimbinganKu.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.User;

@Repository
public class UserRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void save(User user) throws Exception {
        // Explicitly saving ID, Name, Email, Password
        String sql = "INSERT INTO Users (id, name, email, password) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, user.getId(), user.getName(), user.getEmail(), user.getPassword());
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM Users WHERE email = ?";
        List<User> results = jdbcTemplate.query(sql, this::mapRowToUser, email);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public String getUserType(User user) {
        String userId = user.getId();

        // 1. Check if ID exists in Students table
        String studentSql = "SELECT COUNT(*) FROM Students WHERE npm = ?";
        Integer studentCount = jdbcTemplate.queryForObject(studentSql, Integer.class, userId);
        
        if (studentCount != null && studentCount > 0) {
            return "student";
        }

        // 2. Check if ID exists in Lecturers table
        String lecturerSql = "SELECT COUNT(*) FROM Lecturers WHERE lecturerCode = ?";
        Integer lecturerCount = jdbcTemplate.queryForObject(lecturerSql, Integer.class, userId);
        
        if (lecturerCount != null && lecturerCount > 0) {
            return "lecturer";
        }

        // 3. Fallback (likely Admin)
        return "admin";
    }

    private User mapRowToUser(ResultSet resultSet, int rowNum) throws SQLException {
        // FIX: Use Setters to avoid constructor order mismatch
        User user = new User();
        user.setId(resultSet.getString("id"));
        user.setEmail(resultSet.getString("email"));
        user.setPassword(resultSet.getString("password")); 
        user.setName(resultSet.getString("name"));
        return user;
    }
    
    // Helper to get ID if needed
    public String getUserId(User user) {
         return user.getId();
    }
}