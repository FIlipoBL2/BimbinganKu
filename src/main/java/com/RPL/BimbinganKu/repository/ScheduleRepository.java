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
        // Combine StudentSchedule, LecturerSchedule, and GuidanceSchedule
        // For simplicity in this first pass, we'll just fetch GuidanceSchedule as it's
        // the most relevant for "Calendar"
        // But the requirement says "User data", so let's try to get StudentSchedule as
        // well.

        // Let's focus on GuidanceSchedule first as it has dates/times clearly.
        // Actually, the schema has StudentSchedule with day/hourStart/hourEnd.
        // We need to return a unified structure for the calendar.

        String sql = "SELECT 'Guidance' as type, topicCode as title, day, hourStart as \"startTime\", hourEnd as \"endTime\", notes as description FROM GuidanceSchedule";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> findScheduleByUser(String userCode) {
        // This is tricky because we have different tables.
        // Let's check StudentSchedule first.
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
