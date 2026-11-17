document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaPreventivas');
  const tbody = tabla?.querySelector('tbody');
  const form = document.getElementById('formPreventiva');
  const modalEl = document.getElementById('modalPreventiva');
  const modal = new bootstrap.Modal(modalEl);
  const toastEl = document.getElementById('toastPreventivas');
  const toast = new bootstrap.Toast(toastEl);
  const buscar = document.getElementById('buscarPreventiva');
  const filtroEstado = document.getElementById('filtroEstadoPreventiva');
  const titulo = document.getElementById('modalPreventivaTitulo');
  const selectArea = document.getElementById('areaPreventiva');

  const campos = {
    id: document.getElementById('preventivaId'),
    numero: document.getElementById('numeroPreventiva'),
    detalles: document.getElementById('detallesPreventiva'),
    fecha: document.getElementById('fechaPreventiva'),
    area: selectArea,
    estado: document.getElementById('estadoPreventiva')
  };

  let areas = [];
  let areasCargadas = false;

  const escapeHtml = (valor) => String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatoFecha = (fechaIso) => {
    if (!fechaIso) return '-';
    return new Date(fechaIso).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const claseEstado = (estado) => {
    if (estado === 'facturado') return 'prev-facturado';
    if (estado === 'recibido') return 'prev-recibido';
    return 'prev-pendiente';
  };

  const etiquetaEstado = (estado) => {
    if (estado === 'facturado') return 'Facturado';
    if (estado === 'recibido') return 'Recibido';
    return 'Pendiente';
  };

  const mostrarToast = (mensaje, tipo = 'success') => {
    toastEl.className = `toast text-bg-${tipo} border-0`;
    document.getElementById('toastPreventivasMsg').textContent = mensaje;
    toast.show();
  };

  const destruirSelect2 = () => {
    if ($(selectArea).hasClass('select2-hidden-accessible')) {
      $(selectArea).select2('destroy');
    }
  };

  const activarSelect2 = () => {
    $(selectArea).select2({
      dropdownParent: $(modalEl),
      width: '100%',
      placeholder: 'Seleccionar área'
    });
  };

  const cargarAreas = async (valorSeleccionado = '') => {
    if (!areasCargadas) {
      const res = await fetch('/api/areas');
      areas = await res.json();
      areasCargadas = true;
    }

    destruirSelect2();
    selectArea.innerHTML = '<option value="">Seleccionar área</option>' +
      areas.map((a) => `<option value="${a._id}">${escapeHtml(a.nombre)}</option>`).join('');
    selectArea.value = valorSeleccionado;
    activarSelect2();
  };

  const limpiarForm = () => {
    form.reset();
    campos.id.value = '';
    campos.estado.value = 'pendiente';
  };

  const abrirNuevo = async () => {
    limpiarForm();
    titulo.textContent = 'Agregar preventiva';
    await cargarAreas();
    modal.show();
  };

  const abrirEditar = async (fila) => {
    titulo.textContent = 'Modificar preventiva';
    campos.id.value = fila.dataset.id;
    campos.numero.value = fila.dataset.numero;
    campos.detalles.value = fila.dataset.detalles;
    campos.fecha.value = fila.dataset.fecha;
    campos.estado.value = fila.dataset.estado;
    await cargarAreas(fila.dataset.areaId);
    modal.show();
  };

  const filaHtml = (p) => {
    const fechaIso = p.fecha.slice(0, 10);

    return `
    <tr
      class="${claseEstado(p.estado)}"
      data-id="${escapeHtml(p._id)}"
      data-numero="${escapeHtml(p.numeroPreventiva)}"
      data-detalles="${escapeHtml(p.detalles)}"
      data-fecha="${fechaIso}"
      data-area-id="${escapeHtml(p.area?._id || '')}"
      data-area-nombre="${escapeHtml(p.area?.nombre || '')}"
      data-estado="${escapeHtml(p.estado)}">
      <td>${escapeHtml(p.numeroPreventiva)}</td>
      <td>${escapeHtml(p.detalles)}</td>
      <td>${formatoFecha(fechaIso)}</td>
      <td>${escapeHtml(p.area?.nombre || 'Sin área')}</td>
      <td>${etiquetaEstado(p.estado)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" type="button" data-editar="${escapeHtml(p._id)}" title="Modificar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" data-eliminar="${escapeHtml(p._id)}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  };

  const cargarPreventivas = async () => {
    const res = await fetch('/api/preventivas');
    const preventivas = await res.json();

    if (!res.ok) {
      throw new Error(preventivas.error || 'No se pudieron cargar las preventivas');
    }

    tbody.innerHTML = preventivas.length
      ? preventivas.map(filaHtml).join('')
      : '<tr data-empty-row><td colspan="6" class="text-center text-muted py-4">No hay preventivas registradas</td></tr>';

    filtrar();
  };

  const filtrar = () => {
    const texto = buscar.value.trim().toLowerCase();
    const estado = filtroEstado.value;
    const filas = [...tbody.querySelectorAll('tr')].filter((fila) => !fila.dataset.emptyRow);

    filas.forEach((fila) => {
      const coincideTexto = [fila.dataset.numero, fila.dataset.detalles, fila.dataset.areaNombre]
        .join(' ').toLowerCase().includes(texto);
      const coincideEstado = !estado || fila.dataset.estado === estado;
      fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
    });
  };

  document.getElementById('btnNuevaPreventiva').addEventListener('click', abrirNuevo);
  buscar.addEventListener('input', filtrar);
  filtroEstado.addEventListener('change', filtrar);

  tbody.addEventListener('click', async (event) => {
    const btnEditar = event.target.closest('[data-editar]');
    const btnEliminar = event.target.closest('[data-eliminar]');
    const fila = event.target.closest('tr');

    if (btnEditar && fila) {
      await abrirEditar(fila);
      return;
    }

    if (btnEliminar && fila) {
      if (!confirm(`¿Eliminar la preventiva N° ${fila.dataset.numero}?`)) return;

      try {
        const res = await fetch(`/api/preventivas/${fila.dataset.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');

        mostrarToast('Preventiva eliminada');
        await cargarPreventivas();
      } catch (error) {
        mostrarToast(error.message, 'danger');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campos.id.value;
    const payload = {
      numeroPreventiva: campos.numero.value,
      detalles: campos.detalles.value,
      fecha: campos.fecha.value,
      area: campos.area.value,
      estado: campos.estado.value
    };

    try {
      const res = await fetch(id ? `/api/preventivas/${id}` : '/api/preventivas', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      modal.hide();
      mostrarToast(id ? 'Preventiva actualizada' : 'Preventiva agregada');
      await cargarPreventivas();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    destruirSelect2();
  });
});
