document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.formCambiarPass').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const id = form.dataset.id;
        const nuevaPassword = form.nuevaPassword.value.trim();
        const confirmarPassword = form.confirmarPassword.value.trim();
  
        const errorBox = form.querySelector('.error-msg');
        const successBox = form.querySelector('.success-msg');
        errorBox.classList.add('d-none');
        successBox.classList.add('d-none');
  
        try {
          const res = await fetch(`/api/usuarios/${id}/cambiar-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevaPassword, confirmarPassword })
          });
  
          const data = await res.json();
          if (!res.ok) {
            errorBox.textContent = data.error || 'Error';
            errorBox.classList.remove('d-none');
          } else {
            successBox.textContent = data.message || 'Contraseña actualizada';
            successBox.classList.remove('d-none');
            form.reset();
          }
        } catch (err) {
          errorBox.textContent = 'Error de red';
          errorBox.classList.remove('d-none');
        }
      });
    });
  });
  