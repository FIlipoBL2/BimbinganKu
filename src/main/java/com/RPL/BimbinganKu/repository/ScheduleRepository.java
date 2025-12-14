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

    // --- ADMIN / GLOBAL VIEW ---
    public List<Map<String, Object>> findAllSchedules() {
        String sql = "SELECT guidance_id as id, topicCode as title, date, hourStart as startTime, hourEnd as endTime, notes, place FROM GuidanceSchedule";
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> findAllTopicsWithDetails() {
        String sql = """
            SELECT 
                t.topicCode,
                t.topicName,
                us.name as studentName,
                ul.name as lecturerName
            FROM Topic t
            JOIN Users us ON t.npm = us.id
            JOIN Users ul ON t.lecturerCode = ul.id
            ORDER BY ul.name, t.topicCode
        """;
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> findAllGuidanceSessions() {
        String sql = """
            SELECT 
                gs.date,
                TO_CHAR(gs.hourStart, 'HH24:MI') as startTime,
                t.topicName,
                us.name as studentName,
                ul.name as lecturerName,
                gs.place
            FROM GuidanceSchedule gs
            JOIN Topic t ON gs.topicCode = t.topicCode
            JOIN Users us ON t.npm = us.id
            JOIN Users ul ON t.lecturerCode = ul.id
            ORDER BY gs.date DESC, gs.hourStart
        """;
        return jdbcTemplate.queryForList(sql);
    }

    // --- STUDENT VIEW ---
    public List<Map<String, Object>> findScheduleByStudent(String npm) {
        String guidanceSql = """
                    SELECT
                        gs.guidance_id as "id",
                        gs.date,
                        TO_CHAR(gs.hourStart, 'HH24:MI') as "time",
                        t.topicName as "topic",
                        t.topicCode as "topicCode",
                        gs.place as "location",
                        gs.notes as "notes",
                        gs.additionalLecturer as "additionalLecturer",
                        u_main.name as "mainLecturerName",
                        u_add.name as "additionalLecturerName",
                        u_student.name as "studentName",
                        t.NPM as "studentNpm",
                        'guidance' as "type"
                    FROM GuidanceSchedule gs
                    JOIN Topic t ON gs.topicCode = t.topicCode
                    JOIN Users u_main ON t.lecturerCode = u_main.id
                    JOIN Users u_student ON t.NPM = u_student.id
                    LEFT JOIN Users u_add ON gs.additionalLecturer = u_add.id
                    WHERE t.NPM = ?
                """;
        List<Map<String, Object>> schedules = jdbcTemplate.queryForList(guidanceSql, npm);

        String classSql = """
                    SELECT
                        day as day_name,
                        TO_CHAR(hourStart, 'HH24:MI') as time,
                        'Regular Class' as topic,
                        'Classroom' as location,
                        '' as notes,
                        'class' as type
                    FROM StudentSchedule
                    WHERE NPM = ?
                """;
        try {
            schedules.addAll(jdbcTemplate.queryForList(classSql, npm));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return schedules;
    }

    // --- LECTURER VIEW ---
    public List<Map<String, Object>> findScheduleByLecturer(String code) {
        // Updated: Select additionalLecturer
        String guidanceSql = """
                    SELECT
                        gs.guidance_id as id,
                        gs.date,
                        TO_CHAR(gs.hourStart, 'HH24:MI') as time,
                        t.topicName as topic,
                        t.topicCode as topicCode,
                        s.npm as studentNpm,
                        u.name as studentName,
                        gs.place as location,
                        gs.notes,
                        gs.additionalLecturer as "additionalLecturer",
                        'guidance' as type
                    FROM GuidanceSchedule gs
                    INNER JOIN Topic t ON gs.topicCode = t.topicCode
                    INNER JOIN Students s ON t.NPM = s.NPM
                    INNER JOIN Users u ON s.NPM = u.id
                    WHERE t.lecturerCode = ? OR gs.additionalLecturer = ?
                """;

        try {
            List<Map<String, Object>> schedules = jdbcTemplate.queryForList(guidanceSql, code, code);

            String classSql = """
                        SELECT
                            day as day_name,
                            TO_CHAR(hourStart, 'HH24:MI') as time,
                            'Teaching Session' as topic,
                            'Classroom' as location,
                            '' as studentName,
                            '' as studentNpm,
                            '' as notes,
                            NULL as additionalLecturer,
                            'class' as type
                        FROM LecturerSchedule
                        WHERE lecturerCode = ?
                    """;
            try {
                schedules.addAll(jdbcTemplate.queryForList(classSql, code));
            } catch (Exception e) {
            }

            return schedules;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    public void saveGuidanceSchedule(String topicCode, String date, String startTime, String endTime, String notes,
            String place, String additionalLecturer) {
        String sql = "INSERT INTO GuidanceSchedule (topicCode, date, hourStart, hourEnd, notes, place, additionalLecturer) VALUES (?, ?::date, ?::time, ?::time, ?, ?, ?)";
        jdbcTemplate.update(sql, topicCode, date, startTime, endTime, notes, place, additionalLecturer);
    }

    public void updateGuidanceSchedule(Long id, String topicCode, String date, String startTime, String endTime,
            String location, String notes, String additionalLecturer) {
        String sql = "UPDATE GuidanceSchedule SET topicCode = ?, date = ?::date, hourStart = ?::time, hourEnd = ?::time, place = ?, notes = ?, additionalLecturer = ? WHERE guidance_id = ?";
        jdbcTemplate.update(sql, topicCode, date, startTime, endTime, location, notes, additionalLecturer, id);
    }
}