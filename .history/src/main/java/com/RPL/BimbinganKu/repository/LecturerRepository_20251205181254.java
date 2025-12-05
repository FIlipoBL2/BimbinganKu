package com.RPL.BimbinganKu.repository;

import static java.util.Optional.empty;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;

@Repository
public class LecturerRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private UserRepository userRepo;

    public void save(Lecturer user) throws Exception {
        User newUser = new User(user.getId(), user.getEmail(), user.getPassword(), user.getName());
        userRepo.save(newUser);

        String user_id = userRepo.getUserId(newUser);

        String sql = "INSERT INTO Lecturers (lecturerCode) VALUES (?)";
        jdbcTemplate.update(sql, user.getLecturerCode(), user_id);
    }

    public Optional<Lecturer> findByLecturerCode(String code) {
        String sql = "SELECT * FROM Lecturers JOIN Users ON Users.id = Lecturers.lecturerCode WHERE NPM = ?";
        List<Lecturer> results = jdbcTemplate.query(sql, this::mapRowToLecturer, code);
        return results.isEmpty() ? empty() : Optional.of(results.get(0));
    }

    public List<Lecturer> findAll() {
        String sql = "SELECT * FROM Lecturers JOIN Users ON Lecturers.lecturerCode = Users.id";

        return jdbcTemplate.query(sql, this::mapRowToLecturer);
    }

    private Lecturer mapRowToLecturer(ResultSet resultSet, int rowNum) throws SQLException {
        return new Lecturer(
                resultSet.getString("email"),
                resultSet.getString("password"),
                resultSet.getString("name"),
                resultSet.getString("lecturerCode"));
    }
}
