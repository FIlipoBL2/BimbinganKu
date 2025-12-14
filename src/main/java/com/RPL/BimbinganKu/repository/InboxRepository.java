package com.RPL.BimbinganKu.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.RPL.BimbinganKu.data.Inbox;

@Repository
public class InboxRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Inbox> findByUserId(String userId) {
        String sql = "SELECT inbox_ID as id, date, time, msgType, message, user_id as userId FROM Inbox WHERE user_id = ? ORDER BY date DESC, time DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Inbox.class), userId);
    }

    public void markAsRead(Long id) {
        String sql = "UPDATE Inbox SET msgType = 'read' WHERE inbox_ID = ?";
        jdbcTemplate.update(sql, id);
    }

    public void save(Inbox inbox) {
        String sql = "INSERT INTO Inbox (\"date\", \"time\", msgType, message, user_id) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, 
            inbox.getDate(), 
            inbox.getTime(), 
            inbox.getMsgType(), 
            inbox.getMessage(), 
            inbox.getUserId()
        );
    }
}
