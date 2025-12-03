package com.RPL.BimbinganKu.repository;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ScheduleRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> findAllSchedules() {
        String sql = "SELECT 'Guidance' as type, topicCode as title, day, hourStart as \"startTime\", hourEnd as \"endTime\", notes as description FROM GuidanceSchedule";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> findScheduleByUser(String userCode) {
        String studentSql = "SELECT 'Student Class' as type, 'Class' as title, day, hourStart as \"startTime\", hourEnd as \"endTime\" FROM StudentSchedule WHERE NPM = ?";
        List<Map<String, Object>> studentSchedules = jdbcTemplate.queryForList(studentSql, userCode);

        if (!studentSchedules.isEmpty()) {
            return studentSchedules;
        }

        // Check LecturerSchedule
        String lecturerSql = "SELECT 'Lecturer Class' as type, 'Teaching' as title, day, hourStart as \"startTime\", hourEnd as \"endTime\" FROM LecturerSchedule WHERE lecturerCode = ?";
        return jdbcTemplate.queryForList(lecturerSql, userCode);
    }

    public void saveGuidanceSchedule(String topicCode, String day, String startTime, String endTime, String notes,
            String place) {
        String sql = "INSERT INTO GuidanceSchedule (topicCode, day, hourStart, hourEnd, notes, place) VALUES (?, ?, ?::time, ?::time, ?, ?)";
        jdbcTemplate.update(sql, topicCode, day, startTime, endTime, notes, place);
    }
}
