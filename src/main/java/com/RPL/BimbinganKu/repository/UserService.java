package com.RPL.BimbinganKu.repository;

import java.util.Optional;

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
    
    public User login(String email, String password) {
        Optional<User> optional = userRepository.findByEmail(email);
        
        if (optional.isEmpty()) {
            return null;
        }
        
        User user = optional.get();
        
        if (passwordEncoder.matches(password.trim(), user.getPassword())) {
            return user;
        } else return null;
    }
    
    public String getUserType(User user) {
        return userRepository.getUserType(user);
    }
}