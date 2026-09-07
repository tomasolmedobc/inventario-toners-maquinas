document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaVencimientos');
  const tbody = tabla?.querySelector('tbody');

  const form = document.getElementById('formVencimiento');
  const modalEl = document.getElementById('modalVencimiento');
  const modal = new bootstrap.Modal(modalEl);
  const titulo = document.getElementById('modalVencimientoTitulo');
  const grupoUltimo = document.getElementById('grupoUltimoVencimiento');

  const formPagar = document.getElementById('formPagarVencimiento');
  const modalPagarEl = document.getElementById('modalPagarVencimiento');
  const modalPagar = new bootstrap.Modal(modalPagarEl);

  const modalHistorialEl = document.getElementById('modalHistorialVencimiento');
  const modalHistorial = new bootstrap.Modal(modalHistorialEl);

  const toastEl = document.getElementById('toastVencimientos');
  const toast = new bootstrap.Toast(toastEl);
  const buscar = document.getElementById('buscarVencimiento');

  const campos = {
    id: document.getElementById('vencimientoId'),
    empresa: document.getElementById('empresaVencimiento'),
    descripcion: document.getElementById('descripcionVencimiento'),
    ultimo: document.getElementById('ultimoVencimientoInput'),
    proximo: document.getElementById('proximoVencimientoInput'),
    pagado: document.getElementById('pagadoVencimiento')
  };

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

  const diasRestantes = (fechaIso) => {
    const hoy = new Date();
    const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const f = new Date(fechaIso);
    const fUTC = Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
    return Math.round((fUTC - hoyUTC) / 86400000);
  };

  const estaAlDia = (pagado, proximoIso) => pagado || diasRestantes(proximoIso) > 15;

  const claseFila = (pagado, proximoIso) => {
    if (estaAlDia(pagado, proximoIso)) return 'venc-pagado';
    return diasRestantes(proximoIso) <= 5 ? 'venc-urgente' : 'venc-atencion';
  };

  const mostrarToast = (mensaje, tipo = 'success') => {
    toastEl.className = `toast text-bg-${tipo} border-0`;
    document.getElementById('toastVencimientosMsg').textContent = mensaje;
    toast.show();
  };

  const limpiarForm = () => {
    form.reset();
    campos.id.value = '';
  };

  const abrirNuevo = () => {
    limpiarForm();
    titulo.textContent = 'Agregar vencimiento';
    grupoUltimo.classList.add('d-none');
    modal.show();
  };

  const abrirEditar = (fila) => {
    titulo.textContent = 'Modificar vencimiento';
    grupoUltimo.classList.remove('d-none');
    campos.id.value = fila.dataset.id;
    campos.empresa.value = fila.dataset.empresa;
    campos.descripcion.value = fila.dataset.descripcion;
    campos.ultimo.value = fila.dataset.ultimo;
    campos.proximo.value = fila.dataset.proximo;
    campos.pagado.checked = fila.dataset.pagado === 'true';
    modal.show();
  };

  const abrirPagar = (fila) => {
    document.getElementById('pagarVencimientoId').value = fila.dataset.id;
    document.getElementById('pagarVencimientoFechaActual').textContent = formatoFecha(fila.dataset.proximo);
    document.getElementById('proximoVencimientoPago').value = '';
    modalPagar.show();
  };

  const abrirHistorial = (fila) => {
    document.getElementById('historialEmpresaNombre').textContent = fila.dataset.empresa;
    const lista = document.getElementById('listaHistorialPagos');
    let historial = [];
    try {
      historial = JSON.parse(fila.dataset.historial || '[]');
    } catch (error) {
      historial = [];
    }

    lista.innerHTML = historial.length
      ? [...historial].reverse().map((p) => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>Vencimiento del ${formatoFecha(p.vencimientoCubierto)}</span>
            <small class="text-muted">pagado el ${formatoFecha(p.fechaPago)}</small>
          </li>
        `).join('')
      : '<li class="list-group-item text-muted text-center">Sin pagos registrados</li>';

    modalHistorial.show();
  };

  const filaHtml = (v) => {
    const proximoIso = v.proximoVencimiento.slice(0, 10);
    const ultimoIso = v.ultimoVencimiento ? v.ultimoVencimiento.slice(0, 10) : '';
    const historialJson = escapeHtml(JSON.stringify(v.historialPagos || []));

    return `
    <tr
      class="${claseFila(v.pagado, proximoIso)}"
      data-id="${escapeHtml(v._id)}"
      data-empresa="${escapeHtml(v.empresa)}"
      data-descripcion="${escapeHtml(v.descripcion)}"
      data-ultimo="${ultimoIso}"
      data-proximo="${proximoIso}"
      data-pagado="${v.pagado}"
      data-historial='${historialJson}'>
      <td>${escapeHtml(v.empresa)}</td>
      <td>${escapeHtml(v.descripcion)}</td>
      <td>${formatoFecha(ultimoIso)}</td>
      <td>${formatoFecha(proximoIso)}</td>
      <td>${estaAlDia(v.pagado, proximoIso) ? 'Sí' : 'No'}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-success" type="button" data-pagar="${escapeHtml(v._id)}" title="Registrar pago">
            <i class="fa-solid fa-money-bill-wave"></i>
          </button>
          <button class="btn btn-outline-secondary" type="button" data-historial="${escapeHtml(v._id)}" title="Historial de pagos">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </button>
          <button class="btn btn-outline-primary" type="button" data-editar="${escapeHtml(v._id)}" title="Modificar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" data-eliminar="${escapeHtml(v._id)}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  };

  const cargarVencimientos = async () => {
    const res = await fetch('/api/vencimientos');
    const vencimientos = await res.json();

    if (!res.ok) {
      throw new Error(vencimientos.error || 'No se pudieron cargar los vencimientos');
    }

    tbody.innerHTML = vencimientos.length
      ? vencimientos.map(filaHtml).join('')
      : '<tr data-empty-row><td colspan="6" class="text-center text-muted py-4">No hay vencimientos registrados</td></tr>';

    filtrar();
  };

  const filtrar = () => {
    const texto = buscar.value.trim().toLowerCase();
    const filas = [...tbody.querySelectorAll('tr')].filter((fila) => !fila.dataset.emptyRow);

    filas.forEach((fila) => {
      const coincide = [fila.dataset.empresa, fila.dataset.descripcion]
        .join(' ').toLowerCase().includes(texto);
      fila.style.display = coincide ? '' : 'none';
    });
  };

  document.getElementById('btnNuevoVencimiento').addEventListener('click', abrirNuevo);
  buscar.addEventListener('input', filtrar);

  tbody.addEventListener('click', async (event) => {
    const btnEditar = event.target.closest('[data-editar]');
    const btnEliminar = event.target.closest('[data-eliminar]');
    const btnPagar = event.target.closest('[data-pagar]');
    const btnHistorial = event.target.closest('[data-historial]');
    const fila = event.target.closest('tr');

    if (btnEditar && fila) return abrirEditar(fila);
    if (btnPagar && fila) return abrirPagar(fila);
    if (btnHistorial && fila) return abrirHistorial(fila);

    if (btnEliminar && fila) {
      if (!confirm(`¿Eliminar el vencimiento de ${fila.dataset.empresa}?`)) return;

      try {
        const res = await fetch(`/api/vencimientos/${fila.dataset.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');

        mostrarToast('Vencimiento eliminado');
        await cargarVencimientos();
      } catch (error) {
        mostrarToast(error.message, 'danger');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campos.id.value;
    const payload = {
      empresa: campos.empresa.value,
      descripcion: campos.descripcion.value,
      proximoVencimiento: campos.proximo.value,
      pagado: campos.pagado.checked
    };
    if (id) payload.ultimoVencimiento = campos.ultimo.value || null;

    try {
      const res = await fetch(id ? `/api/vencimientos/${id}` : '/api/vencimientos', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      modal.hide();
      mostrarToast(id ? 'Vencimiento actualizado' : 'Vencimiento agregado');
      await cargarVencimientos();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });

  formPagar.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('pagarVencimientoId').value;
    const proximoVencimiento = document.getElementById('proximoVencimientoPago').value;

    try {
      const res = await fetch(`/api/vencimientos/${id}/pagar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proximoVencimiento })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar el pago');

      modalPagar.hide();
      mostrarToast(proximoVencimiento ? 'Pago registrado, próximo vencimiento cargado' : 'Pago registrado');
      await cargarVencimientos();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });
});
