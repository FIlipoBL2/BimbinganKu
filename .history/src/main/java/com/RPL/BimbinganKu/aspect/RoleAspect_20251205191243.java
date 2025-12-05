package com.RPL.BimbinganKu.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.RPL.BimbinganKu.annotation.RequiresRole;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Aspect
@Component
public class RoleAspect {
    @Around("@annotation(requiresRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequiresRole requiresRole) throws Throwable {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) return "redirect:/login";

        HttpServletRequest request = attributes.getRequest();
        HttpSession session = request.getSession(false);

        if (session = null || session.getAttribute("curUser") == null) {
            return "redirect:/login";
        }
    }
}
