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
}
