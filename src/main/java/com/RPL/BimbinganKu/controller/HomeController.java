package com.RPL.BimbinganKu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.LecturerRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;

import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private LecturerRepository lecturerRepo;

    @GetMapping("/student/home")
    public String showStudentDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null) {
            return "redirect:/login";
        }

        Student student = studentRepo.findByNPM(user.getId()).orElse(null);

        if (student != null) {
            model.addAttribute("student", student);
            model.addAttribute("studentName", student.getName());
            model.addAttribute("npm", student.getId());
            model.addAttribute("sessionCountUTS", student.getTotalGuidanceUTS());
            model.addAttribute("sessionCountUAS", student.getTotalGuidanceUAS());
        }

        return "student";
    }

    @GetMapping("/lecturer/home")
    public String showLecturerDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null) {
            return "redirect:/login";
        }

        Lecturer lecturer = lecturerRepo.findByLecturerCode(user.getId()).orElse(null);

        if (lecturer != null) {
            model.addAttribute("lecturer", lecturer);
            model.addAttribute("lecturerName", lecturer.getName());
            model.addAttribute("lecturerCode", lecturer.getId());
        }

        return "lecturer";
    }

    @GetMapping("/admin/dashboard")
    public String showAdminDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null || !"0".equals(user.getId())) {
            return "redirect:/login";
        }

        model.addAttribute("adminName", user.getName());
        return "admin";
    }

    // --- Inbox Endpoint ---
    @GetMapping("/inbox")
    public String showInbox(@RequestParam(required = false) String role, HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null) {
            return "redirect:/login";
        }

        // Pass role to the view so 'Back to Dashboard' link works correctly
        model.addAttribute("role", role != null ? role : "student");
        model.addAttribute("userName", user.getName());

        return "inbox";
    }
}