let idUsuarioActual = '';

window.abrirModal = function(id, nombre) {
  idUsuarioActual = id;
  document.getElementById('usuarioId').value = id;
  document.getElementById('nuevaPassword').value = '';
  document.getElementById('confirmarPassword').value = '';
  document.getElementById('msgError').innerText = '';
  const modal = new bootstrap.Modal(document.getElementById('modalPassword'));
  modal.show();
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCambiarPassword');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const nuevaPassword = document.getElementById('nuevaPassword').value;
      const confirmarPassword = document.getElementById('confirmarPassword').value;
      const msgError = document.getElementById('msgError');

      if (nuevaPassword !== confirmarPassword) {
        msgError.innerText = 'Las contraseñas no coinciden.';
        return;
      }

      fetch(`/admin/usuarios/${idUsuarioActual}/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaPassword, confirmarPassword })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert(data.message);
            bootstrap.Modal.getInstance(document.getElementById('modalPassword')).hide();
          } else {
            msgError.innerText = data.error || 'Ocurrió un error.';
          }
        });
    });
  }
});
