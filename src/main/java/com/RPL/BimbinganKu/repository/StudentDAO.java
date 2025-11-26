package com.RPL.BimbinganKu.repository;

import com.RPL.BimbinganKu.model.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StudentDAO {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public StudentDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Student> findAll() {
        // *** FIX: Added JOIN to 'users' table to fetch the student's name ***
        // Alias 's' for student and 'u' for users
        String sql = "SELECT s.npm, u.name, s.total_guidance_uts AS guidance_count " +
                     "FROM student s JOIN users u ON s.user_id = u.id"; 
        
        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Student(
                rs.getString("npm"),
                rs.getString("name"),
                // Major field is omitted as it is not in the schema snippet
                rs.getInt("guidance_count")
            )
        );
    }
    
    // ... other methods ...
}