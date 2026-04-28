document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaTelefonos');
  const tbody = tabla?.querySelector('tbody');
  const form = document.getElementById('formTelefono');
  const modalEl = document.getElementById('modalTelefono');
  const modal = new bootstrap.Modal(modalEl);
  const toastEl = document.getElementById('toastTelefonos');
  const toast = new bootstrap.Toast(toastEl);
  const buscar = document.getElementById('buscarTelefono');
  const filtroEstado = document.getElementById('filtroEstadoTelefono');
  const grupoEstado = document.getElementById('grupoEstadoTelefono');
  const titulo = document.getElementById('modalTelefonoTitulo');

  const campos = {
    id: document.getElementById('telefonoId'),
    numeroTelefonico: document.getElementById('numeroTelefonico'),
    empresa: document.getElementById('empresaTelefono'),
    dependencia: document.getElementById('dependenciaTelefono'),
    personaCargo: document.getElementById('personaCargoTelefono'),
    estado: document.getElementById('estadoTelefono')
  };

  const escapeHtml = (valor) => String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const mostrarToast = (mensaje, tipo = 'success') => {
    toastEl.className = `toast text-bg-${tipo} border-0`;
    document.getElementById('toastTelefonosMsg').textContent = mensaje;
    toast.show();
  };

  const limpiarForm = () => {
    form.reset();
    campos.id.value = '';
    campos.estado.value = 'ACTIVO';
  };

  const abrirNuevo = () => {
    limpiarForm();
    titulo.textContent = 'Agregar telefono';
    grupoEstado.classList.add('d-none');
    modal.show();
  };

  const abrirEditar = (fila) => {
    titulo.textContent = 'Modificar telefono';
    grupoEstado.classList.remove('d-none');
    campos.id.value = fila.dataset.id;
    campos.numeroTelefonico.value = fila.dataset.numero;
    campos.empresa.value = fila.dataset.empresa;
    campos.dependencia.value = fila.dataset.dependencia;
    campos.personaCargo.value = fila.dataset.persona;
    campos.estado.value = fila.dataset.estado;
    modal.show();
  };

  const badgeEstado = (estado) => {
    const clase = estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary';
    return `<span class="badge ${clase}">${escapeHtml(estado)}</span>`;
  };

  const filaHtml = (telefono) => `
    <tr
      data-id="${escapeHtml(telefono._id)}"
      data-numero="${escapeHtml(telefono.numeroTelefonico)}"
      data-empresa="${escapeHtml(telefono.empresa)}"
      data-dependencia="${escapeHtml(telefono.dependencia)}"
      data-persona="${escapeHtml(telefono.personaCargo)}"
      data-estado="${escapeHtml(telefono.estado)}">
      <td>${escapeHtml(telefono.numeroTelefonico)}</td>
      <td>${escapeHtml(telefono.empresa)}</td>
      <td>${escapeHtml(telefono.dependencia)}</td>
      <td>${escapeHtml(telefono.personaCargo)}</td>
      <td>${badgeEstado(telefono.estado)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" type="button" data-editar="${escapeHtml(telefono._id)}" title="Modificar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" data-baja="${escapeHtml(telefono._id)}" title="Dar de baja" ${telefono.estado === 'BAJA' ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-down-wide-short"></i>
          </button>
        </div>
      </td>
    </tr>`;

  const cargarTelefonos = async () => {
    const res = await fetch('/api/telefonos');
    const telefonos = await res.json();

    if (!res.ok) {
      throw new Error(telefonos.error || 'No se pudieron cargar los telefonos');
    }

    tbody.innerHTML = telefonos.length
      ? telefonos.map(filaHtml).join('')
      : '<tr data-empty-row><td colspan="6" class="text-center text-muted py-4">No hay telefonos registrados</td></tr>';

    filtrar();
  };

  const filtrar = () => {
    const texto = buscar.value.trim().toLowerCase();
    const estado = filtroEstado.value;
    const filas = [...tbody.querySelectorAll('tr')].filter((fila) => !fila.dataset.emptyRow);

    filas.forEach((fila) => {
      const coincideTexto = [
        fila.dataset.numero,
        fila.dataset.empresa,
        fila.dataset.dependencia,
        fila.dataset.persona
      ].join(' ').toLowerCase().includes(texto);
      const coincideEstado = !estado || fila.dataset.estado === estado;

      fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
    });
  };

  document.getElementById('btnNuevoTelefono').addEventListener('click', abrirNuevo);
  buscar.addEventListener('input', filtrar);
  filtroEstado.addEventListener('change', filtrar);

  tbody.addEventListener('click', async (event) => {
    const btnEditar = event.target.closest('[data-editar]');
    const btnBaja = event.target.closest('[data-baja]');
    const fila = event.target.closest('tr');

    if (btnEditar && fila) {
      abrirEditar(fila);
      return;
    }

    if (btnBaja && fila) {
      if (!confirm(`Dar de baja el numero ${fila.dataset.numero}?`)) return;

      try {
        const res = await fetch(`/api/telefonos/${fila.dataset.id}/baja`, { method: 'PATCH' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo dar de baja');

        mostrarToast('Telefono dado de baja');
        await cargarTelefonos();
      } catch (error) {
        mostrarToast(error.message, 'danger');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campos.id.value;
    const payload = Object.fromEntries(new FormData(form));
    if (!id) delete payload.estado;

    try {
      const res = await fetch(id ? `/api/telefonos/${id}` : '/api/telefonos', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      modal.hide();
      mostrarToast(id ? 'Telefono actualizado' : 'Telefono agregado');
      await cargarTelefonos();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });
});
