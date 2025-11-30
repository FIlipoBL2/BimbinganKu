package com.RPL.BimbinganKu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.repository.UserService;

@Controller
public class temp {
    @Autowired
    private UserService userService;
    
    @GetMapping("/temp")
    public String createVariable() {
        Student student = new Student("admin@gmail.com", "admin", "admin", "6182301024", 0, 0);

        return "";
    }
}
