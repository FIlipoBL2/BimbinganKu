package com.RPL.BimbinganKu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.LecturerRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;
import com.RPL.BimbinganKu.repository.UserRepository;

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

    @Transactional
    public boolean saveStudent(Student student) {
        try {
            student = encodePassword(student);
            // studentRepository handles the split save (Users + Students tables)
            studentRepository.save(student);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean saveLecturer(Lecturer lecturer) {
        try {
            lecturer = encodePassword(lecturer);
            lecturerRepository.save(lecturer);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public User login(String email, String password) {
        // findByEmail is now available in UserRepository
        User user = userRepository.findByEmail(email.trim()).orElse(null);

        if (user == null) {
            return null;
        }

        if (passwordEncoder.matches(password.trim(), user.getPassword())) {
            return user;
        } else {
            return null;
        }
    }

    public String getUserType(User user) {
        return userRepository.getUserType(user);
    }
}