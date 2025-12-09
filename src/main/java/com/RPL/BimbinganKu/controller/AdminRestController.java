package com.RPL.BimbinganKu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.LecturerRepository;
import com.RPL.BimbinganKu.repository.ScheduleRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;
import com.RPL.BimbinganKu.service.CsvImportService;
import com.RPL.BimbinganKu.service.PDFService;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private LecturerRepository lecturerRepo;

    @Autowired
    private CsvImportService csvImportService;

    @Autowired
    private PDFService pdfService;

    // --- NEW: Endpoints for Data Preview Tabs ---

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        try {
            System.out.println("Admin requesting all students...");
            List<Student> students = studentRepo.findAll();
            System.out.println("Found " + students.size() + " students.");
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            // Return JSON so frontend doesn't crash
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    @GetMapping("/lecturers")
    public ResponseEntity<?> getAllLecturers() {
        try {
            System.out.println("Admin requesting all lecturers...");
            List<Lecturer> lecturers = lecturerRepo.findAll();
            return ResponseEntity.ok(lecturers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    @GetMapping("/schedules")
    public ResponseEntity<?> getAllSchedules() {
        try {
            System.out.println("Admin requesting all schedules...");
            List<Map<String, Object>> schedules = scheduleRepo.findAllSchedules();
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    @GetMapping("/topics")
    public ResponseEntity<?> getAllTopics() {
        try {
            List<Map<String, Object>> topics = scheduleRepo.findAllTopicsWithDetails();
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getAllSessions() {
        try {
            List<Map<String, Object>> sessions = scheduleRepo.findAllGuidanceSessions();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    // --- Individual Schedule Lookup ---

    @GetMapping("/schedule/{userCode}")
    public ResponseEntity<?> getUserSchedule(@PathVariable String userCode) {
        try {
            // Try to find student schedule first
            List<Map<String, Object>> schedule = scheduleRepo.findScheduleByStudent(userCode);

            // If empty, try to find lecturer schedule
            if (schedule.isEmpty()) {
                schedule = scheduleRepo.findScheduleByLecturer(userCode);
            }
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Database Error: " + e.getMessage()));
        }
    }

    // --- Import Handler ---

    @PostMapping("/import")
    public ResponseEntity<?> importFile(@RequestParam("file") MultipartFile file,
            @RequestParam("table") String table) {
        try {
            if ("student".equalsIgnoreCase(table)) {
                csvImportService.importStudents(file);
                return ResponseEntity.ok(Map.of("message", "Students imported successfully"));
            } else if ("lecturer".equalsIgnoreCase(table)) {
                csvImportService.importLecturers(file);
                return ResponseEntity.ok(Map.of("message", "Lecturers imported successfully"));
            } else if ("schedule".equalsIgnoreCase(table)) {
                csvImportService.importSchedules(file);
                return ResponseEntity.ok(Map.of("message", "Schedules imported successfully"));
            } else if ("npmtopic".equalsIgnoreCase(table)) {
                csvImportService.importTopics(file);
                return ResponseEntity.ok(Map.of("message", "Topics imported successfully"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown table type: " + table));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }

    // --- NEW: Export Student Table as PDF ---

    @GetMapping("/export-student-pdf")
    public ResponseEntity<byte[]> exportStudentTablePdf() {
        try {
            System.out.println("Admin requesting student table PDF export...");
            List<Student> students = studentRepo.findAll();
            byte[] pdfBytes = pdfService.generateStudentTablePdf(students);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student-table.pdf");
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentLength(pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("PDF export error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
}