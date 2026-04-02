// Sistema de autenticación simulado
const VALID_CREDENTIALS = {
    email: 'admin@nexus.com',
    password: 'admin123'
};

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        // Guardar sesión
        localStorage.setItem('nexus_admin_logged', 'true');
        localStorage.setItem('nexus_admin_email', email);
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ Credenciales incorrectas. Usa admin@nexus.com / admin123';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
});

// Verificar si ya está logueado
if (localStorage.getItem('nexus_admin_logged') === 'true') {
    window.location.href = 'dashboard.html';
}