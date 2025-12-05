package com.RPL.BimbinganKu.aspect;

import org.springframework.stereotype.Component;

@Aspect
@Component
public class RoleAspect {
    @Around("@annotation(requiresRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequiresRole requiresRole) throws Throwable {

    }
}
