package com.RPL.BimbinganKu.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.RPL.BimbinganKu.data.User;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        try {
            userRepository.save(user);
        } catch (Exception e) {
            return false;
        }
        return true;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email).get();

        if (user == null) return null;

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else return null;
    }

    public String getUserType(User user) {
        return userRepository.getUserType(user);
    }
}
