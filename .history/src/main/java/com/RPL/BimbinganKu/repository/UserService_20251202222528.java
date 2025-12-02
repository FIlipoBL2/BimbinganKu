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
    private PasswordEncoder passwordEncoder;

    private final String adminEmail = "admin";
    private final String adminPass = "admin123"

    private <T extends User> T encodePassword(T user) {
        user.setPassword(passwordEncoder.encode(user.getPassword().trim()));

        return user;
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

    public User login(String email, String password) {
        if(login)


        User user = userRepository.findByEmail(email.trim()).get();

        if (user == null) return null;

        if (passwordEncoder.matches(password.trim(), user.getPassword())) {
            return user;
        } else return null;
    }

    public String getUserType(User user) {
        return userRepository.getUserType(user);
    }
}
