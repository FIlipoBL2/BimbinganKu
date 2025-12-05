package com.RPL.BimbinganKu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.RPL.BimbinganKu.annotation.LoginRequired;
import com.RPL.BimbinganKu.annotation.RequiresRole;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.UserType;
import com.RPL.BimbinganKu.repository.StudentRepository;

import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

    @Autowired
    private StudentRepository studentRepo;

    /**
     * Maps to the student dashboard and fetches dynamic data from the database.
     */
    @LoginRequired
    @RequiresRole({UserType.STUDENT})
    @GetMapping("/student/home")
    public String showStudentDashboard(Model model) {
        List<Student> students = studentRepo.findAll();
        
        if (!students.isEmpty()) {
            Student currentStudent = students.get(0);
            model.addAttribute("studentName", currentStudent.getName()); 
            model.addAttribute("sessionCount", currentStudent.getTotalGuidanceUTS());
        } else {
            model.addAttribute("studentName", "[No Student Data]");
            model.addAttribute("sessionCount", 0);
        }
        
        return "student";
    }

    /**
     * Maps to the lecturer dashboard.
     */
    @LoginRequired
    @RequiresRole({UserType.LECTURER})
    @GetMapping("/lecturer/home")
    public String showLecturerDashboard(Model model) {
        // Here, you would fetch and add Lecturer-specific data using a LecturerDAO
        model.addAttribute("lecturerName", "Dr. Smith");
        return "lecturer";
    }

    /**
     * Maps to the admin dashboard.
     */
    @LoginRequired
    @RequiresRole({UserType.ADMIN})
    @GetMapping("/admin/dashboard")
    public String showAdminDashboard(Model model) {
        // Here, you would fetch data necessary for admin tables/reports
        return "admin";
    }

    /**
     * Handles the logout request and redirects to the login page.
     */
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login"; // Redirects to the /login path mapped in showLogin()
    }
}