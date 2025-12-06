package com.RPL.BimbinganKu.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // This bean is REQUIRED by UserService to encrypt passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF to allow easy POST requests (like your CSV import)
            .csrf(csrf -> csrf.disable())
            
            // Allow all requests. 
            // Since you are checking "session.getAttribute('loggedUser')" manually 
            // in your Controllers, we tell Spring Security to get out of the way.
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll() // Allow styling
                .requestMatchers("/login", "/register", "/api/**").permitAll() // Allow logic
                .anyRequest().permitAll()
            )
            
            // Disable default Spring login page (since you made your own)
            .formLogin(login -> login.disable())
            .logout(logout -> logout.disable());

        return http.build();
    }
}