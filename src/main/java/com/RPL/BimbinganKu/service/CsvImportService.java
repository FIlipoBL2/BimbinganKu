package com.RPL.BimbinganKu.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.UserService;

@Service
public class CsvImportService {

    @Autowired
    private UserService userService;

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
                    // Assuming CSV format: NPM, Name, Email, Password
                    String npm = values[0].trim();
                    String name = values[1].trim();
                    String email = values[2].trim();
                    String password = values[3].trim();

                    // Create Student object (assuming default 0 for guidance counts)
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
                    // LecturerCode, Name, Email, Password
                    String code = values[0].trim();
                    String name = values[1].trim();
                    String email = values[2].trim();
                    String password = values[3].trim();

                    Lecturer lecturer = new Lecturer(email, password, name, code);
                    userService.saveLecturer(lecturer);
                }
            }
        }
    }

    @Autowired
    private com.RPL.BimbinganKu.repository.TopicRepository topicRepo;

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
                    // TopicCode, NPM, LecturerCode, TopicName
                    String topicCode = values[0].trim();
                    String npm = values[1].trim();
                    String lecturerCode = values[2].trim();
                    String topicName = values[3].trim();

                    topicRepo.save(topicCode, npm, lecturerCode, topicName);
                }
            }
        }
    }

    @Autowired
    private com.RPL.BimbinganKu.repository.ScheduleRepository scheduleRepo;

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
                    // TopicCode, Day, StartTime, EndTime, Notes, Place
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
