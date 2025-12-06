package com.RPL.BimbinganKu.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.ScheduleRepository;
import com.RPL.BimbinganKu.repository.TopicRepository;

@Service
public class CsvImportService {

    @Autowired
    private UserService userService;

    @Autowired
    private TopicRepository topicRepo;

    @Autowired
    private ScheduleRepository scheduleRepo;

    public void importStudents(MultipartFile file) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                String[] values = line.split(",");
                if (values.length >= 4) {
                    // CSV Format: NPM, Name, Email, Password
                    // FIX: No parsing to Long needed. Just use Strings.
                    String npm = values[0].trim();
                    String name = values[1].trim();
                    String email = values[2].trim();
                    String password = values[3].trim();

                    // Create Student using String ID constructor
                    Student student = new Student(email, password, name, npm, 0, 0);
                    userService.saveStudent(student);
                }
            }
        }
    }

    public void importLecturers(MultipartFile file) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] values = line.split(",");
                if (values.length >= 4) {
                    // CSV Format: Code, Name, Email, Password
                    // FIX: No parsing to Long needed.
                    String code = values[0].trim();
                    String name = values[1].trim();
                    String email = values[2].trim();
                    String password = values[3].trim();

                    // Create Lecturer using String ID constructor
                    Lecturer lecturer = new Lecturer(email, password, name, code);
                    userService.saveLecturer(lecturer);
                }
            }
        }
    }

    public void importTopics(MultipartFile file) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] values = line.split(",");
                if (values.length >= 4) {
                    String topicCode = values[0].trim();
                    String npm = values[1].trim();
                    String lecturerCode = values[2].trim();
                    String topicName = values[3].trim();

                    topicRepo.save(topicCode, npm, lecturerCode, topicName);
                }
            }
        }
    }

    public void importSchedules(MultipartFile file) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] values = line.split(",");
                if (values.length >= 6) {
                    String topicCode = values[0].trim();
                    String day = values[1].trim();
                    String startTime = values[2].trim();
                    String endTime = values[3].trim();
                    String notes = values[4].trim();
                    String place = values[5].trim();

                    scheduleRepo.saveGuidanceSchedule(topicCode, day, startTime, endTime, notes, place);
                }
            }
        }
    }
}