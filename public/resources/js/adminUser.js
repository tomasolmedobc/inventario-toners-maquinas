document.addEventListener('DOMContentLoaded', () => {
    // Abrir modal cambiar contraseña
    document.querySelectorAll('.btn-cambiar-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        document.getElementById('userIdPassword').value = userId;
        document.getElementById('nuevaPassword').value = '';
        document.getElementById('confirmarPassword').value = '';
        const modal = new bootstrap.Modal(document.getElementById('modalPassword'));
        modal.show();
      });
    });
  
    // Enviar cambio de contraseña
    document.getElementById('formPassword').addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('userIdPassword').value;
      const nuevaPassword = document.getElementById('nuevaPassword').value.trim();
      const confirmarPassword = document.getElementById('confirmarPassword').value.trim();
  
      if (!nuevaPassword || nuevaPassword.length < 6 || nuevaPassword !== confirmarPassword) {
        alert('La contraseña debe tener al menos 6 caracteres y coincidir.');
        return;
      }
  
      try {
        const res = await fetch(`/api/usuarios/${userId}/cambiar-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevaPassword, confirmarPassword })
        });
  
        const data = await res.json();
        if (res.ok) {
          alert('Contraseña actualizada correctamente.');
          bootstrap.Modal.getInstance(document.getElementById('modalPassword')).hide();
        } else {
          alert(data.error || 'Error al cambiar contraseña.');
        }
      } catch (err) {
        alert('Error de red al cambiar contraseña.');
        console.error(err);
      }
    });
  
    // Abrir modal cambio de rol
    document.querySelectorAll('.btn-editar-rol').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        const rolActual = btn.dataset.rol;
        document.getElementById('userRol').value = userId;
        document.getElementById('selectRolModal').value = rolActual;
        const modal = new bootstrap.Modal(document.getElementById('modalRol'));
        modal.show();
      });
    });
  
    // Enviar cambio de rol
    document.getElementById('formRol').addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('userRol').value;
      const nuevoRol = document.getElementById('selectRolModal').value;
  
      try {
        const res = await fetch(`/api/usuarios/${userId}/cambiar-rol`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rol: nuevoRol })
        });
  
        const data = await res.json();
        if (data.success) {
          alert('Rol actualizado correctamente.');
          bootstrap.Modal.getInstance(document.getElementById('modalRol')).hide();
          location.reload();
        } else {
          alert(data.error || 'Error al cambiar rol.');
        }
      } catch (err) {
        alert('Error de red al cambiar rol.');
        console.error(err);
      }
    });
  
    // Eliminar usuario
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.id;
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  
        fetch(`/api/usuarios/${userId}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              alert('Usuario eliminado correctamente.');
              location.reload();
            } else {
              alert(data.error || 'Error al eliminar usuario.');
            }
          })
          .catch(err => {
            alert('Error de red al eliminar usuario.');
            console.error(err);
          });
      });
    });
  });
  