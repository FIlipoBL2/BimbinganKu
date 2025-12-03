package com.RPL.BimbinganKu.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import static java.util.Optional.empty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;

@Repository
public class StudentRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepo;

    void save(Student user) throws Exception {
        User newUser = new User(user.getEmail(), user.getPassword(), user.getName());
        userRepo.save(newUser);

        String user_id = userRepo.getUserId(newUser);

        String sql = "INSERT INTO Students (npm) VALUES (?)";
        jdbcTemplate.update(sql, user.getNpm(), user_id);
    }

    Optional<Student> findByNPM(String npm) {
        String sql = "SELECT * FROM Students JOIN Users ON Users.id = Students.NPM WHERE NPM = ?";
        List<Student> results = jdbcTemplate.query(sql, this::mapRowToStudent, npm);
        return results.isEmpty() ? empty() : Optional.of(results.get(0));
    }

    public List<Student> findAll() {
        String sql = "SELECT * FROM Students JOIN Users ON Students.NPM = Users.id";

        return jdbcTemplate.query(sql, this::mapRowToStudent);
    }

    private Student mapRowToStudent(ResultSet resultSet, int rowNum) throws SQLException {
        return new Student(
                resultSet.getString("email"),
                resultSet.getString("password"),
                resultSet.getString("name"),
                resultSet.getString("npm"),
                resultSet.getInt("totalGuidanceUAS"),
                resultSet.getInt("totalGuidanceUTS"));
    }
}
