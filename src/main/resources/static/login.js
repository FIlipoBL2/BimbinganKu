document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        // 1. Get username and convert to uppercase for robust checking
        const username = document.getElementById('username').value.trim().toUpperCase();
        const password = document.getElementById('password').value;

        // --- MOCK ROLE DETERMINATION BASED ON ID/CODE ---
        let role = 'student'; // Default role is Student
        
        // Determine role based on ID/Code prefix (L, D for Lecturer, ADMIN for Admin)
        if (username.startsWith('L') || username.startsWith('D')) { 
            role = 'lecturer';
        } else if (username.startsWith('ADMIN')) {
            role = 'admin';
        }
        
        // --- SIMULATE LOGIN SUCCESS AND REDIRECT TO CONTROLLER ENDPOINTS ---
        let redirectUrl = '/student/home'; // Default redirect is Student Dashboard

        if (role === 'lecturer') {
            redirectUrl = '/lecturer/home';
        } else if (role === 'admin') {
            redirectUrl = '/admin/dashboard';
        }
        
        // Redirect the browser to the Controller's URL
        window.location.href = redirectUrl; 
    });
});