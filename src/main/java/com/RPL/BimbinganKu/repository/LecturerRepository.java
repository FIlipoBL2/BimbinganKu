package com.RPL.BimbinganKu.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.User;

@Repository
public class LecturerRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<User> findAll() {
        String sql = "SELECT * FROM Lecturers JOIN Users ON Lecturers.lecturerCode = Users.id";
        return jdbcTemplate.query(sql, this::mapRowToLecturer);
    }

    private User mapRowToLecturer(ResultSet resultSet, int rowNum) throws SQLException {
        return new User(
                resultSet.getString("email"),
                resultSet.getString("password"),
                resultSet.getString("id"), // Map lecturerCode/id to User.id
                resultSet.getString("name"));
    }

    public void save(User user) {
        String sql = "INSERT INTO Lecturers (lecturerCode) VALUES (?)";
        jdbcTemplate.update(sql, user.getId());
    }
}
