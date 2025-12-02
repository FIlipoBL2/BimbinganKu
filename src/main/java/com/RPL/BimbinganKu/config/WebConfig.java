package com.RPL.BimbinganKu.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map the URL paths (without .html) to the view templates
        registry.addViewController("/inbox").setViewName("inbox");
        registry.addViewController("/student").setViewName("student");
        registry.addViewController("/lecturer").setViewName("lecturer");
    }
}