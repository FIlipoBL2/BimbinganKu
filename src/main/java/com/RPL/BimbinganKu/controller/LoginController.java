package com.RPL.BimbinganKu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.service.UserService;

import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public String loginProcess(@RequestParam String email, @RequestParam String password, HttpSession session,
            Model model) {

        // 1. Check for Admin Login FIRST (Hardcoded for now)
        if ("admin".equals(email) && "admin123".equals(password)) {
            User adminUser = new User();
            // Fix: Use String ID "0"
            adminUser.setId("0");
            adminUser.setEmail("admin");
            adminUser.setName("Administrator");
            adminUser.setPassword("hidden");

            session.setAttribute("loggedUser", adminUser);
            return "redirect:/admin/dashboard";
        }

        // 2. Check for Database User Login
        User user = userService.login(email, password);

        if (user == null) {
            model.addAttribute("status", "failed");
            return "login";
        }

        // 3. Success - Set Session
        session.setAttribute("loggedUser", user);

        // 4. Determine Role (Student or Lecturer)
        String role = userService.getUserType(user);

        if ("student".equals(role)) {
            return "redirect:/student/home";
        } else if ("lecturer".equals(role)) {
            return "redirect:/lecturer/home";
        } else {
            // Fallback if role is undefined
            return "redirect:/login?error=role_undefined";
        }
    }

    @GetMapping("/login")
    public String loginPage(HttpSession session) {

        User logged = (User) session.getAttribute("loggedUser");

        if (logged != null) {
            // Fix: Check String ID "0"
            if ("0".equals(logged.getId()) && "admin".equals(logged.getEmail())) {
                return "redirect:/admin/dashboard";
            }

            String role = userService.getUserType(logged);

            if ("student".equals(role)) {
                return "redirect:/student/home";
            } else if ("lecturer".equals(role)) {
                return "redirect:/lecturer/home";
            }
        }

        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}