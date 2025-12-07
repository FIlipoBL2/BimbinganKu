package com.RPL.BimbinganKu.controller;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.ScheduleRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;

@RestController
@RequestMapping("/api")
public class ScheduleRestController {

    @Autowired
    private ScheduleRepository scheduleRepo;
    
    @Autowired
    private StudentRepository studentRepo;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/student/schedule/{npm}")
    public List<Map<String, Object>> getStudentSchedule(@PathVariable String npm) {
        return scheduleRepo.findScheduleByStudent(npm); 
    }

    @GetMapping("/lecturer/schedule/{code}")
    public List<Map<String, Object>> getLecturerSchedule(@PathVariable String code) {
        return scheduleRepo.findScheduleByLecturer(code);
    }
    
    @GetMapping("/lecturer/students/{code}")
    public List<Student> getLecturerStudents(@PathVariable String code) {
        return studentRepo.findStudentsByLecturer(code);
    }

    @PostMapping("/student/session")
    public ResponseEntity<?> saveOrUpdateSession(@RequestBody Map<String, String> payload) {
        try {
            String idStr = payload.get("id");
            String topicCode = payload.get("topicCode");
            String studentNpm = payload.get("studentNpm"); 
            
            String date = payload.get("date");
            String time = payload.get("time");
            String location = payload.get("location");
            String notes = payload.get("notes");
            
            if (notes == null) notes = "";

            String endTime = time;
            try {
                LocalTime startTimeObj = LocalTime.parse(time);
                endTime = startTimeObj.plusHours(1).format(DateTimeFormatter.ofPattern("HH:mm"));
            } catch (Exception e) {}

            if ((topicCode == null || topicCode.isEmpty()) && studentNpm != null) {
                try {
                    String sql = "SELECT topicCode FROM Topic WHERE NPM = ? LIMIT 1";
                    topicCode = jdbcTemplate.queryForObject(sql, String.class, studentNpm);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Student " + studentNpm + " has no assigned Topic."));
                }
            }

            if (idStr != null && !idStr.isEmpty()) {
                // UPDATE
                Long id = Long.parseLong(idStr);
                scheduleRepo.updateGuidanceSchedule(id, topicCode, date, time, endTime, location, notes);
                return ResponseEntity.ok(Map.of("message", "Session updated successfully"));
            } else {
                // CREATE
                scheduleRepo.saveGuidanceSchedule(topicCode, date, time, endTime, notes, location);
                return ResponseEntity.ok(Map.of("message", "Session created successfully"));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // NEW: Delete Session Endpoint
    @DeleteMapping("/session/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id) {
        try {
            String sql = "DELETE FROM GuidanceSchedule WHERE guidance_id = ?";
            int rows = jdbcTemplate.update(sql, id);
            if (rows > 0) {
                return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}