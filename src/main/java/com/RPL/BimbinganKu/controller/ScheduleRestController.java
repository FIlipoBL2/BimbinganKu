package com.RPL.BimbinganKu.controller;

import java.time.LocalDate;
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

import com.RPL.BimbinganKu.data.Akademik;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.AkademikRepository;
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
    private AkademikRepository akademikRepo;

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
            String additionalLecturer = payload.get("additionalLecturer");

            if (notes == null)
                notes = "";
            if (additionalLecturer != null && additionalLecturer.trim().isEmpty()) {
                additionalLecturer = null; // Convert empty string to null for DB
            }

            String endTime = time;
            try {
                LocalTime startTimeObj = LocalTime.parse(time);
                endTime = startTimeObj.plusHours(1).format(DateTimeFormatter.ofPattern("HH:mm"));
            } catch (Exception e) {
            }

            if ((topicCode == null || topicCode.isEmpty()) && studentNpm != null) {
                try {
                    String sql = "SELECT topicCode FROM Topic WHERE NPM = ? LIMIT 1";
                    topicCode = jdbcTemplate.queryForObject(sql, String.class, studentNpm);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Student " + studentNpm + " has no assigned Topic."));
                }
            }

            // Get studentNpm from topicCode if not provided
            if (studentNpm == null && topicCode != null) {
                try {
                    studentNpm = jdbcTemplate.queryForObject("SELECT npm FROM Topic WHERE topicCode = ?", String.class,
                            topicCode);
                } catch (Exception e) {
                    // ignore
                }
            }

            if (idStr != null && !idStr.isEmpty()) {
                // UPDATE - no count change
                Long id = Long.parseLong(idStr);
                scheduleRepo.updateGuidanceSchedule(id, topicCode, date, time, endTime, location, notes,
                        additionalLecturer);
                return ResponseEntity.ok(Map.of("message", "Session updated successfully"));
            } else {
                // CREATE - increment count based on current academic period
                scheduleRepo.saveGuidanceSchedule(topicCode, date, time, endTime, notes, location, additionalLecturer);

                // Increment guidance count
                if (studentNpm != null) {
                    incrementGuidanceCount(studentNpm);
                }

                return ResponseEntity.ok(Map.of("message", "Session created successfully"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable Long id) {
        try {
            // Get studentNpm before deleting
            String studentNpm = null;
            try {
                String sql = "SELECT t.npm FROM GuidanceSchedule gs JOIN Topic t ON gs.topicCode = t.topicCode WHERE gs.guidance_id = ?";
                studentNpm = jdbcTemplate.queryForObject(sql, String.class, id);
            } catch (Exception e) {
                // ignore
            }

            String deleteSql = "DELETE FROM GuidanceSchedule WHERE guidance_id = ?";
            int rows = jdbcTemplate.update(deleteSql, id);

            if (rows > 0) {
                // Decrement guidance count
                if (studentNpm != null) {
                    decrementGuidanceCount(studentNpm);
                }
                return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Increment guidance count based on current academic period.
     * - If current date is before UTS deadline: increment totalGuidanceUTS
     * - If current date is after UTS deadline but before UAS deadline: increment
     * totalGuidanceUAS
     * - Otherwise: no change (outside semester)
     */
    private void incrementGuidanceCount(String npm) {
        Akademik ak = akademikRepo.findCurrentAkademik().orElse(null);
        if (ak == null)
            return;

        LocalDate today = LocalDate.now();
        LocalDate semStart = ak.getSemesterStart();
        LocalDate utsEnd = ak.getUtsDeadline();
        LocalDate uasEnd = ak.getUasDeadline();

        if (semStart != null && today.isBefore(semStart)) {
            // Before semester starts - no count
            return;
        }

        if (utsEnd != null && !today.isAfter(utsEnd)) {
            // In UTS period (semStart <= today <= utsEnd)
            jdbcTemplate.update("UPDATE Students SET totalGuidanceUTS = totalGuidanceUTS + 1 WHERE npm = ?", npm);
        } else if (uasEnd != null && !today.isAfter(uasEnd)) {
            // In UAS period (utsEnd < today <= uasEnd)
            jdbcTemplate.update("UPDATE Students SET totalGuidanceUAS = totalGuidanceUAS + 1 WHERE npm = ?", npm);
        }
        // After UAS deadline - no count
    }

    /**
     * Decrement guidance count based on current academic period.
     */
    private void decrementGuidanceCount(String npm) {
        Akademik ak = akademikRepo.findCurrentAkademik().orElse(null);
        if (ak == null)
            return;

        LocalDate today = LocalDate.now();
        LocalDate semStart = ak.getSemesterStart();
        LocalDate utsEnd = ak.getUtsDeadline();
        LocalDate uasEnd = ak.getUasDeadline();

        if (semStart != null && today.isBefore(semStart)) {
            return;
        }

        if (utsEnd != null && !today.isAfter(utsEnd)) {
            jdbcTemplate.update(
                    "UPDATE Students SET totalGuidanceUTS = GREATEST(0, totalGuidanceUTS - 1) WHERE npm = ?", npm);
        } else if (uasEnd != null && !today.isAfter(uasEnd)) {
            jdbcTemplate.update(
                    "UPDATE Students SET totalGuidanceUAS = GREATEST(0, totalGuidanceUAS - 1) WHERE npm = ?", npm);
        }
    }
}