package com.RPL.BimbinganKu.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.RPL.BimbinganKu.data.Akademik;
import com.RPL.BimbinganKu.data.Lecturer;
import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.LecturerRepository;
import com.RPL.BimbinganKu.repository.StudentRepository;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
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

    @Autowired
    private com.RPL.BimbinganKu.repository.TopicRepository topicRepo;

    private static final int REQUIRED_SESSIONS = 3;

    /**
     * Helper method to determine current academic period (UTS, UAS, or NONE).
     */
    private String determineCurrentPeriod(Akademik ak) {
        if (ak == null)
            return "NONE";

        LocalDate today = LocalDate.now();
        LocalDate semStart = ak.getSemesterStart();
        LocalDate utsEnd = ak.getUtsDeadline();
        LocalDate uasEnd = ak.getUasDeadline();

        if (semStart == null || utsEnd == null || uasEnd == null)
            return "NONE";

        if (!today.isBefore(semStart) && !today.isAfter(utsEnd)) {
            return "UTS";
        } else if (today.isAfter(utsEnd) && !today.isAfter(uasEnd)) {
            return "UAS";
        }
        return "NONE";
    }

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

            // Get the student's main lecturer from their Topic assignment
            String mainLecturerCode = topicRepo.findLecturerCodeByNpm(student.getId());
            model.addAttribute("mainLecturerCode", mainLecturerCode != null ? mainLecturerCode : "");
        }

        model.addAttribute("requiredSessions", REQUIRED_SESSIONS);

        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
            model.addAttribute("semesterStart", ak.getSemesterStart());

            String currentPeriod = determineCurrentPeriod(ak);
            int currentSessionCount = 0;
            if ("UTS".equals(currentPeriod) && student != null) {
                currentSessionCount = student.getTotalGuidanceUTS();
            } else if ("UAS".equals(currentPeriod) && student != null) {
                currentSessionCount = student.getTotalGuidanceUAS();
            }

            model.addAttribute("currentPeriod", currentPeriod);
            model.addAttribute("currentSessionCount", currentSessionCount);
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

            List<Lecturer> allLecturers = lecturerRepo.findAll();
            model.addAttribute("allLecturers", allLecturers);
        } else {
            return "redirect:/login";
        }

        model.addAttribute("requiredSessions", REQUIRED_SESSIONS);

        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
            model.addAttribute("semesterStart", ak.getSemesterStart());
            model.addAttribute("currentPeriod", determineCurrentPeriod(ak));
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

        akademikRepo.findCurrentAkademik().ifPresent(ak -> {
            model.addAttribute("currentYear", ak.getYear());
            model.addAttribute("currentSemester", ak.getSemester());
            model.addAttribute("utsDeadline", ak.getUtsDeadline());
            model.addAttribute("uasDeadline", ak.getUasDeadline());
        });

        return "admin";
    }

    @GetMapping("/inbox")
    public String showInbox(@RequestParam(required = false) String role, HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedUser");

        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("role", role != null ? role : "student");
        model.addAttribute("userName", user.getName());

        return "inbox";
    }
}