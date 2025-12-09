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

    public void save(Student student) throws Exception {
        User newUser = new User();
        newUser.setId(student.getId());
        newUser.setEmail(student.getEmail());
        newUser.setPassword(student.getPassword());
        newUser.setName(student.getName());

        userRepo.save(newUser);

        String sql = "INSERT INTO Students (npm) VALUES (?)";
        jdbcTemplate.update(sql, student.getNpm());
    }

    public Optional<Student> findByNPM(String npm) {
        String sql = """
            SELECT u.email, u.password, u.name, s.npm, s.totalGuidanceUTS, s.totalGuidanceUAS 
            FROM Students s 
            JOIN Users u ON u.id = s.npm 
            WHERE s.npm = ?
        """;
        List<Student> results = jdbcTemplate.query(sql, this::mapRowToStudent, npm);
        return results.isEmpty() ? empty() : Optional.of(results.get(0));
    }

    public List<Student> findAll() {
        String sql = """
            SELECT u.email, u.password, u.name, s.npm, s.totalGuidanceUTS, s.totalGuidanceUAS 
            FROM Students s 
            JOIN Users u ON s.npm = u.id
        """;
        return jdbcTemplate.query(sql, this::mapRowToStudent);
    }

    // NEW: Find students assigned to a specific lecturer
    public List<Student> findStudentsByLecturer(String lecturerCode) {
        String sql = """
            SELECT u.email, u.password, u.name, s.npm, s.totalGuidanceUTS, s.totalGuidanceUAS 
            FROM Students s 
            JOIN Users u ON s.npm = u.id
            JOIN Topic t ON s.npm = t.NPM
            WHERE t.lecturerCode = ?
        """;
        return jdbcTemplate.query(sql, this::mapRowToStudent, lecturerCode);
    }

    private Student mapRowToStudent(ResultSet resultSet, int rowNum) throws SQLException {
        Student student = new Student();
        student.setNpm(resultSet.getString("npm"));
        student.setId(resultSet.getString("npm"));
        student.setEmail(resultSet.getString("email"));
        student.setPassword(resultSet.getString("password"));
        student.setName(resultSet.getString("name"));
        student.setTotalGuidanceUAS(resultSet.getInt("totalGuidanceUAS"));
        student.setTotalGuidanceUTS(resultSet.getInt("totalGuidanceUTS"));
        return student;
    }
}