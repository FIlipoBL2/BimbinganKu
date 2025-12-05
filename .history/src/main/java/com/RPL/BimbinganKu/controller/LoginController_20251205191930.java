package com.RPL.BimbinganKu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.data.UserType;
import com.RPL.BimbinganKu.service.UserService;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {
    @Autowired
    private UserService userService;
    
    User admin = new User("admin", "admin123", "admin", "admin");

    @PostMapping("/login")
    public String loginProcess(@RequestParam String email, @RequestParam String password, HttpSession session, Model model) {
    
        User user = userService.login(email, password);
        String role = "";
        
        if (user == null) {
            if (email.equals(admin.getEmail()) && password.equals(admin.getPassword())) {
                session.setAttribute("curUser", UserType.ADMIN);
                user = admin;
                role = "admin";
            } else {
                model.addAttribute("status", "failed");
                return "login";
            }
        }
        
        model.addAttribute("status", null);
        session.setAttribute("loggedUser", user);
        if (role.equals("")) role = userService.getUserType(user);
        
        switch (role) {
            case "student":
            return "redirect:/student/home";
            case "lecturer":
            return "redirect:/lecturer/home";
            default:
            return "redirect:/admin/dashboard";
        }
    }
    
    @GetMapping("/login")
    public String loginPage(HttpSession session) {
        
        User logged = (User) session.getAttribute("loggedUser");
        
        if (logged != null) {
            // User already logged in → redirect based on role
            String role = userService.getUserType(logged);
            
            if (role.equals("student")) {
                return "redirect:/student/home";
            } else {
                return "redirect:/lecturer/home";
            }
        }
        
        return "login";
    }
    
}
