document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // --- SIMULATE LOGIN SUCCESS AND REDIRECT TO CONTROLLER ENDPOINTS ---
        let redirectUrl = '/student/home'; // Correct default for Student Dashboard

        if (role === 'lecturer') {
            redirectUrl = '/lecturer/home';
        } else if (role === 'admin') {
            redirectUrl = '/admin/dashboard';
        }
        
        // Redirect the browser to the Controller's URL
        window.location.href = redirectUrl; 
    });
});