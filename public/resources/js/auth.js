document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
  
    if (registroForm) {
      registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(registroForm));
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
        const result = await res.json();
        alert(result.mensaje || result.error);
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(loginForm));
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
        const result = await res.json();
        if (result.token) {
          localStorage.setItem('token', result.token);
          alert('Login exitoso. Bienvenido, ' + result.usuario.nombre);
          // Redirigir a otra página si querés:
          // window.location.href = '/dashboard.html';
        } else {
          alert(result.error);
        }
      });
    }
  });
  