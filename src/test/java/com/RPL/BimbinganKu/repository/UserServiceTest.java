package com.RPL.BimbinganKu.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.RPL.BimbinganKu.data.Student;
import com.RPL.BimbinganKu.data.User;
import com.RPL.BimbinganKu.service.UserService;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    public void testSaveStudent() throws Exception {
        Student student = new Student("student@test.com", "password", "Student Name", "123456", 0, 0);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        boolean result = userService.saveStudent(student);

        assertTrue(result);
        verify(studentRepository).save(student);
    }

    @Test
    public void testLoginSuccess() {
        User mockUser = new User("9876543210", "test@test.com", "encodedPassword", "Test User");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);

        User result = userService.login("test@test.com", "password");

        assertNotNull(result);
        assertEquals("test@test.com", result.getEmail());
    }

    @Test
    public void testLoginWrongPassword() {
        User mockUser = new User("HEH", "test@test.com", "encodedPassword", "Test User");
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongpass", "encodedPassword")).thenReturn(false);

        User result = userService.login("test@test.com", "wrongpass");

        assertNull(result);
    }

    @Test
    public void testLoginUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        User result = userService.login("unknown@test.com", "password");

        assertNull(result);
    }

    @Test
    public void testGetUserType() {
        User mockUser = new User("test", "test@test.com", "password", "Test User");
        when(userRepository.getUserType(mockUser)).thenReturn("student");

        String role = userService.getUserType(mockUser);

        assertEquals("student", role);
        verify(userRepository).getUserType(mockUser);
    }
}
