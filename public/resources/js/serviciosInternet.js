document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaServiciosInternet');
  const tbody = tabla?.querySelector('tbody');
  const form = document.getElementById('formServicioInternet');
  const modalEl = document.getElementById('modalServicioInternet');
  const modal = new bootstrap.Modal(modalEl);
  const toastEl = document.getElementById('toastServiciosInternet');
  const toast = new bootstrap.Toast(toastEl);
  const buscar = document.getElementById('buscarServicioInternet');
  const titulo = document.getElementById('modalServicioInternetTitulo');
  const selectArea = document.getElementById('areaServicioInternet');

  const campos = {
    id: document.getElementById('servicioInternetId'),
    proveedor: document.getElementById('proveedorServicioInternet'),
    area: selectArea,
    direccion: document.getElementById('direccionServicioInternet'),
    telefono: document.getElementById('telefonoServicioInternet'),
    personaCargo: document.getElementById('personaCargoServicioInternet')
  };

  let areas = [];
  let areasCargadas = false;

  const escapeHtml = (valor) => String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const mostrarToast = (mensaje, tipo = 'success') => {
    toastEl.className = `toast text-bg-${tipo} border-0`;
    document.getElementById('toastServiciosInternetMsg').textContent = mensaje;
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
  };

  const abrirNuevo = async () => {
    limpiarForm();
    titulo.textContent = 'Agregar servicio de internet';
    await cargarAreas();
    modal.show();
  };

  const abrirEditar = async (fila) => {
    titulo.textContent = 'Modificar servicio de internet';
    campos.id.value = fila.dataset.id;
    campos.proveedor.value = fila.dataset.proveedor;
    campos.direccion.value = fila.dataset.direccion;
    campos.telefono.value = fila.dataset.telefono;
    campos.personaCargo.value = fila.dataset.persona;
    await cargarAreas(fila.dataset.areaId);
    modal.show();
  };

  const filaHtml = (servicio) => `
    <tr
      data-id="${escapeHtml(servicio._id)}"
      data-proveedor="${escapeHtml(servicio.proveedor)}"
      data-area-id="${escapeHtml(servicio.area?._id || '')}"
      data-area-nombre="${escapeHtml(servicio.area?.nombre || '')}"
      data-direccion="${escapeHtml(servicio.direccion)}"
      data-telefono="${escapeHtml(servicio.telefono)}"
      data-persona="${escapeHtml(servicio.personaCargo)}">
      <td>${escapeHtml(servicio.proveedor)}</td>
      <td>${escapeHtml(servicio.area?.nombre || 'Sin área')}</td>
      <td>${escapeHtml(servicio.direccion)}</td>
      <td>${escapeHtml(servicio.telefono)}</td>
      <td>${escapeHtml(servicio.personaCargo)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" type="button" data-editar="${escapeHtml(servicio._id)}" title="Modificar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" data-eliminar="${escapeHtml(servicio._id)}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;

  const cargarServicios = async () => {
    const res = await fetch('/api/servicios-internet');
    const servicios = await res.json();

    if (!res.ok) {
      throw new Error(servicios.error || 'No se pudieron cargar los servicios de internet');
    }

    tbody.innerHTML = servicios.length
      ? servicios.map(filaHtml).join('')
      : '<tr data-empty-row><td colspan="6" class="text-center text-muted py-4">No hay servicios de internet registrados</td></tr>';

    filtrar();
  };

  const filtrar = () => {
    const texto = buscar.value.trim().toLowerCase();
    const filas = [...tbody.querySelectorAll('tr')].filter((fila) => !fila.dataset.emptyRow);

    filas.forEach((fila) => {
      const coincide = [
        fila.dataset.proveedor,
        fila.dataset.areaNombre,
        fila.dataset.direccion,
        fila.dataset.telefono,
        fila.dataset.persona
      ].join(' ').toLowerCase().includes(texto);

      fila.style.display = coincide ? '' : 'none';
    });
  };

  document.getElementById('btnNuevoServicioInternet').addEventListener('click', abrirNuevo);
  buscar.addEventListener('input', filtrar);

  tbody.addEventListener('click', async (event) => {
    const btnEditar = event.target.closest('[data-editar]');
    const btnEliminar = event.target.closest('[data-eliminar]');
    const fila = event.target.closest('tr');

    if (btnEditar && fila) {
      await abrirEditar(fila);
      return;
    }

    if (btnEliminar && fila) {
      if (!confirm(`¿Eliminar el servicio de ${fila.dataset.proveedor}?`)) return;

      try {
        const res = await fetch(`/api/servicios-internet/${fila.dataset.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');

        mostrarToast('Servicio eliminado');
        await cargarServicios();
      } catch (error) {
        mostrarToast(error.message, 'danger');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campos.id.value;
    const payload = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(id ? `/api/servicios-internet/${id}` : '/api/servicios-internet', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      modal.hide();
      mostrarToast(id ? 'Servicio actualizado' : 'Servicio agregado');
      await cargarServicios();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    destruirSelect2();
  });
});
