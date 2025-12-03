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
        String sql = "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getPassword());
    }

    public Optional<User> findByName(String name) {
        String sql = "SELECT * FROM Users WHERE name = ?";
        List<User> results = jdbcTemplate.query(sql, this::mapRowToUser, name);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM Users WHERE email = ?";
        List<User> results = jdbcTemplate.query(sql, this::mapRowToUser, email);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public String getUserId(User user) {
        String sql = "SELECT id FROM Users WHERE email = ?";
        return jdbcTemplate.queryForObject(sql, String.class, user.getEmail());
    }

    public String getUserType(User user) {
        String user_id = getUserId(user);

        boolean isStudent = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM Students WHERE NPM = ?)",
                Boolean.class,
                user_id);

        boolean isLecturer = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM Lecturers WHERE lecturerCode = ?)",
                Boolean.class,
                user_id);

        if (isStudent)
            return "student";
        else if (isLecturer)
            return "lecturer";
        else
            return null;
    }

    private User mapRowToUser(ResultSet resultSet, int rowNum) throws SQLException {
        return new User(
                resultSet.getString("id"),
                resultSet.getString("email"),
                resultSet.getString("password"),
                resultSet.getString("name"));
    }
}
