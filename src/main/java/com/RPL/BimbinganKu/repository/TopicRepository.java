package com.RPL.BimbinganKu.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TopicRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void save(String topicCode, String npm, String lecturerCode, String topicName) {
        String sql = "INSERT INTO Topic (topicCode, NPM, lecturerCode, topicName) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, topicCode, npm, lecturerCode, topicName);
    }

    /**
     * Get the main lecturer code for a student based on their Topic assignment.
     */
    public String findLecturerCodeByNpm(String npm) {
        try {
            String sql = "SELECT lecturerCode FROM Topic WHERE npm = ? LIMIT 1";
            return jdbcTemplate.queryForObject(sql, String.class, npm);
        } catch (Exception e) {
            return null;
        }
    }
}
