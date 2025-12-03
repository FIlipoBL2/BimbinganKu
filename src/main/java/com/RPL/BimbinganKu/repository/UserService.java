package com.RPL.BimbinganKu.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private <T extends User> T encodePassword(T user) {
        user.setPassword(passwordEncoder.encode(user.getPassword().trim()));

        return user;
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password.trim());
    }

    public boolean saveStudent(Student student) {
        student = encodePassword(student);

        try {
            studentRepository.save(student);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    public boolean saveLecturer(User lecturer) {
        lecturer = encodePassword(lecturer);
        try {
            // First save to Users table (handled by LecturerRepository.save which calls
            // jdbcTemplate for Lecturers,
            // but wait, LecturerRepository.save only inserts into Lecturers table.
            // We need to insert into Users table first.
            // StudentRepository.save calls userRepo.save(newUser) then inserts into
            // Students.
            // So we should do the same here.
            userRepository.save(lecturer);
            lecturerRepository.save(lecturer);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email.trim()).orElse(null);

        if (user == null)
            return null;

        if (passwordEncoder.matches(password.trim(), user.getPassword())) {
            return user;
        } else
            return null;
    }

    public String getUserType(User user) {
        return userRepository.getUserType(user);
    }
}