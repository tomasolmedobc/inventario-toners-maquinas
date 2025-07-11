document.addEventListener('DOMContentLoaded', () => {
  const inputBusqueda = document.getElementById('busqueda');
  const filtroFecha = document.getElementById('filtroFecha');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const tbody = document.getElementById('tablaEntregas');

  const filasPorPagina = 10;
  let paginaActual = 1;
  let filasFiltradas = [];

  const obtenerFilas = () => [...tbody.querySelectorAll('tr')];

  const actualizarFiltrado = () => {
    const texto = inputBusqueda.value.toLowerCase();
    const fechaFiltro = filtroFecha.value;

    filasFiltradas = obtenerFilas().filter(fila => {
      const coincideTexto = fila.textContent.toLowerCase().includes(texto);
      const fechaTexto = fila.cells[6]?.textContent || '';
      const fechaFila = new Date(fechaTexto);
      const coincideFecha = !fechaFiltro || fechaFila.toISOString().slice(0, 10) === fechaFiltro;
      return coincideTexto && coincideFecha;
    });

    paginaActual = 1;
    mostrarPagina();
  };

  const mostrarPagina = () => {
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = paginaActual * filasPorPagina;

    obtenerFilas().forEach(fila => (fila.style.display = 'none'));
    filasFiltradas.slice(inicio, fin).forEach(fila => {
      fila.style.display = '';
    });

    prevBtn.disabled = paginaActual === 1;
    nextBtn.disabled = paginaActual * filasPorPagina >= filasFiltradas.length;
  };

  inputBusqueda.addEventListener('input', actualizarFiltrado);
  filtroFecha.addEventListener('change', actualizarFiltrado);

  prevBtn.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      mostrarPagina();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (paginaActual * filasPorPagina < filasFiltradas.length) {
      paginaActual++;
      mostrarPagina();
    }
  });

  actualizarFiltrado();

  // --- Editar entrega ---
  const modalEditar = new bootstrap.Modal(document.getElementById('modalEditarEntrega'));
  const formEditar = document.getElementById('formEditarEntrega');

  document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-editar-entrega')) {
      const id = e.target.dataset.id;
      const cantidad = e.target.dataset.cantidad;
      document.getElementById('movimientoId').value = id;
      document.getElementById('nuevaCantidad').value = cantidad;
      document.getElementById('observacionEdit').value = '';
      modalEditar.show();
    }
  });

  formEditar.addEventListener('submit', async e => {
    e.preventDefault();

    const id = document.getElementById('movimientoId').value;
    const nuevaCantidad = parseInt(document.getElementById('nuevaCantidad').value);
    const observacion = document.getElementById('observacionEdit').value.trim();

    if (!observacion) {
      alert('Debes ingresar un motivo para la modificación.');
      return;
    }

    try {
      const res = await fetch(`/api/entregas/${id}/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevaCantidad, observacion })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Entrega modificada correctamente');
        location.reload();
      } else {
        alert(data.error || 'Error al modificar entrega');
      }
    } catch (err) {
      console.error(err);
      alert('Error al comunicarse con el servidor');
    }
  });
  const tabla = document.getElementById('tablaEntregas');

  tabla.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-anular-entrega')) {
      const id = e.target.dataset.id;
  
      const confirm = await Swal.fire({
        title: '¿Anular entrega?',
        text: 'Esto marcará la entrega como anulada y devolverá el stock.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar'
      });
  
      if (confirm.isConfirmed) {
        try {
          const res = await fetch(`/api/movimientos/${id}/anular`, {
            method: 'PATCH'
          });
  
          const data = await res.json();
  
          if (res.ok) {
            Swal.fire('Anulado', data.mensaje, 'success');
            const fila = e.target.closest('tr');
            fila.classList.add('table-danger');
            fila.classList.add('text-decoration-line-through');
            fila.querySelector('.btn-anular-entrega').disabled = true;
          } else {
            Swal.fire('Error', data.error || 'Error al anular', 'error');
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'No se pudo anular la entrega', 'error');
        }
      }
    }
  });
});
document.getElementById('toggleAnuladas').addEventListener('change', (e) => {
  const mostrarAnuladas = e.target.checked;
  document.querySelectorAll('#tablaEntregas tr').forEach(fila => {
    if (fila.classList.contains('table-danger')) {
      fila.style.display = mostrarAnuladas ? '' : 'none';
    }
  });
});