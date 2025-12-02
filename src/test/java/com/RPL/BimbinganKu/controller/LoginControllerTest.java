package com.RPL.BimbinganKu.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.repository.UserService;

@WebMvcTest(LoginController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass Security Filters
public class LoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Test
    public void testAdminLoginSuccess() throws Exception {
        mockMvc.perform(post("/login")
                .param("email", "admin")
                .param("password", "admin123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/dashboard"));
    }

    @Test
    public void testStudentLoginSuccess() throws Exception {
        User mockUser = new User("student@test.com", "password", "Student Name");
        when(userService.login(anyString(), anyString())).thenReturn(mockUser);
        when(userService.getUserType(mockUser)).thenReturn("student");

        mockMvc.perform(post("/login")
                .param("email", "student@test.com")
                .param("password", "password"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/student/home"));
    }

    @Test
    public void testLecturerLoginSuccess() throws Exception {
        User mockUser = new User("lecturer@test.com", "password", "Lecturer Name");
        when(userService.login(anyString(), anyString())).thenReturn(mockUser);
        when(userService.getUserType(mockUser)).thenReturn("lecturer");

        mockMvc.perform(post("/login")
                .param("email", "lecturer@test.com")
                .param("password", "password"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/lecturer/home"));
    }

    @Test
    public void testLoginFailure() throws Exception {
        when(userService.login(anyString(), anyString())).thenReturn(null);

        mockMvc.perform(post("/login")
                .param("email", "wrong@test.com")
                .param("password", "wrongpass"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"))
                .andExpect(model().attribute("status", "failed"));
    }
}
