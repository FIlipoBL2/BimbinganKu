package com.RPL.BimbinganKu.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.LecturerRepository;
import com.RPL.BimbinganKu.repository.ScheduleRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;
import com.RPL.BimbinganKu.service.CsvImportService;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private LecturerRepository lecturerRepo;

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private CsvImportService csvImportService;

    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    @GetMapping("/lecturers")
    public List<User> getAllLecturers() {
        return lecturerRepo.findAll();
    }

    @GetMapping("/schedules")
    public List<Map<String, Object>> getAllSchedules() {
        return scheduleRepo.findAllSchedules();
    }

    @GetMapping("/schedule/{userCode}")
    public List<Map<String, Object>> getUserSchedule(@PathVariable String userCode) {
        return scheduleRepo.findScheduleByUser(userCode);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importFile(@RequestParam("file") MultipartFile file,
            @RequestParam("table") String table) {
        try {
            if ("student".equalsIgnoreCase(table)) {
                csvImportService.importStudents(file);
                return ResponseEntity.ok("Students imported successfully");
            } else if ("lecturer".equalsIgnoreCase(table)) {
                csvImportService.importLecturers(file);
                return ResponseEntity.ok("Lecturers imported successfully");
            } else if ("schedule".equalsIgnoreCase(table)) {
                csvImportService.importSchedules(file);
                return ResponseEntity.ok("Schedules imported successfully");
            } else if ("npmtopic".equalsIgnoreCase(table)) {
                csvImportService.importTopics(file);
                return ResponseEntity.ok("Topics imported successfully");
            }
            return ResponseEntity.badRequest().body("Unknown table type: " + table);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Import failed: " + e.getMessage());
        }
    }
}
