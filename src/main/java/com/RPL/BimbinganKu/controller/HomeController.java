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
import java.util.List;
import java.util.Optional;

@Controller
public class HomeController {

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private LecturerRepository lecturerRepo;

    @Autowired
    private com.RPL.BimbinganKu.repository.AkademikRepository akademikRepo;

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

        // Add Academic Info
        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
        });

        return "student";
    }

    @GetMapping("/lecturer/home")
    public String showLecturerDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null) {
            return "redirect:/login";
        }

        String lecturerCode = user.getId();
        Optional<Lecturer> lecturerOpt = lecturerRepo.findByLecturerCode(lecturerCode);

        if (lecturerOpt.isPresent()) {
            model.addAttribute("lecturer", lecturerOpt.get());
            model.addAttribute("userName", lecturerOpt.get().getName());
            model.addAttribute("lecturerCode", lecturerCode);

            // Task 4: Fetch all other lecturers for "Additional Lecturer" dropdown
            List<Lecturer> allLecturers = lecturerRepo.findAll();
            // Optional: Filter out current lecturer?
            // allLecturers.removeIf(l -> l.getLecturerCode().equals(lecturerCode));
            model.addAttribute("allLecturers", allLecturers);
        } else {
            return "redirect:/login";
        }

        // Academic Info & Deadlines
        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
        });

        return "lecturer";
    }

    @GetMapping("/admin/dashboard")
    public String showAdminDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null || !"0".equals(user.getId())) {
            return "redirect:/login";
        }

        model.addAttribute("adminName", user.getName());

        // Add Academic Info
        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
        });

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