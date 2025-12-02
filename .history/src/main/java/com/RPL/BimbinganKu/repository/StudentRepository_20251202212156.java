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
        
        int user_id = userRepo.getUserId(newUser);

        String sql = "INSERT INTO Students (npm, user_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, user.getNpm(), user_id);
    }

    Optional<Student> findByNPM(String npm) {
        String sql = "SELECT * FROM Students WHERE npm = ?";
        List<Student> results = jdbcTemplate.query(sql, this::mapRowToStudent, npm);
        return results.isEmpty() ? empty() : Optional.of(results.get(0));
    }

    private Student mapRowToStudent(ResultSet resultSet, int rowNum) throws SQLException {
        return new Student(
            resultSet.getString("email"),
            resultSet.getString("password"),
            resultSet.getString("name"),
            resultSet.getString("npm"),
            resultSet.getInt("total_guidance_uas"),
            resultSet.getInt("total_guidance_uts")
        );
    }

    public List<Student> findAll() {
        // *** FIX: Added JOIN to 'users' table to fetch the student's name ***
        // Alias 's' for student and 'u' for users
        String sql = "SELECT s.npm, u.name, s.total_guidance_uts AS guidance_count " + "FROM student s JOIN users u ON s.user_id = u.id";
        
        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Student(
                rs.getString("npm"),
                rs.getString("name"),
                // Major field is omitted as it is not in the schema snippet
                rs.getInt("guidance_count")
            )
        );
    }
}
