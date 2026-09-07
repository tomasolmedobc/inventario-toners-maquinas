document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('tablaOrdenesCompra');
  const tbody = tabla?.querySelector('tbody');
  const form = document.getElementById('formOrdenCompra');
  const modalEl = document.getElementById('modalOrdenCompra');
  const modal = new bootstrap.Modal(modalEl);
  const toastEl = document.getElementById('toastOrdenesCompra');
  const toast = new bootstrap.Toast(toastEl);
  const buscar = document.getElementById('buscarOrdenCompra');
  const filtroDesde = document.getElementById('filtroDesdeOrdenCompra');
  const filtroHasta = document.getElementById('filtroHastaOrdenCompra');
  const titulo = document.getElementById('modalOrdenCompraTitulo');

  const listaFacturas = document.getElementById('listaFacturasOrdenCompra');
  const btnAgregarFactura = document.getElementById('btnAgregarFactura');
  const progresoFacturas = document.getElementById('progresoFacturasOrdenCompra');

  const campos = {
    id: document.getElementById('ordenCompraId'),
    empresa: document.getElementById('empresaOrdenCompra'),
    numeroOrden: document.getElementById('numeroOrdenOrdenCompra'),
    emision: document.getElementById('fechaEmisionOrdenCompra'),
    finalizacion: document.getElementById('fechaFinalizacionOrdenCompra'),
    cantidad: document.getElementById('cantidadFacturasOrdenCompra'),
    detalles: document.getElementById('detallesOrdenCompra')
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

  const formatoMesAnio = (mesIso) => {
    if (!mesIso) return '-';
    const [anio, mes] = mesIso.split('-');
    return `${mes}/${anio}`;
  };

  const mostrarToast = (mensaje, tipo = 'success') => {
    toastEl.className = `toast text-bg-${tipo} border-0`;
    document.getElementById('toastOrdenesCompraMsg').textContent = mensaje;
    toast.show();
  };

  const crearFilaFactura = (numero = '', mesAnio = '') => {
    const fila = document.createElement('div');
    fila.className = 'row g-2 align-items-end mb-2 factura-row';
    fila.innerHTML = `
      <div class="col-6">
        <input class="form-control form-control-sm" placeholder="N° de factura" data-factura-numero>
      </div>
      <div class="col-4">
        <input type="month" class="form-control form-control-sm" data-factura-mes>
      </div>
      <div class="col-2 text-end">
        <button type="button" class="btn btn-outline-danger btn-sm" data-factura-quitar title="Quitar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>`;

    fila.querySelector('[data-factura-numero]').value = numero;
    fila.querySelector('[data-factura-mes]').value = mesAnio;
    fila.querySelector('[data-factura-quitar]').addEventListener('click', () => {
      fila.remove();
      actualizarProgresoFacturas();
    });

    return fila;
  };

  const actualizarProgresoFacturas = () => {
    const cargadas = listaFacturas.children.length;
    const esperadas = Number(campos.cantidad.value) || 0;
    progresoFacturas.textContent = `${cargadas}/${esperadas}`;
    progresoFacturas.className = `badge text-bg-${cargadas >= esperadas && esperadas > 0 ? 'success' : 'secondary'}`;
    btnAgregarFactura.disabled = esperadas > 0 && cargadas >= esperadas;
  };

  campos.cantidad.addEventListener('input', actualizarProgresoFacturas);

  btnAgregarFactura.addEventListener('click', () => {
    const fila = crearFilaFactura();
    listaFacturas.appendChild(fila);
    fila.querySelector('[data-factura-numero]').focus();
    actualizarProgresoFacturas();
  });

  const limpiarForm = () => {
    form.reset();
    campos.id.value = '';
    listaFacturas.innerHTML = '';
    actualizarProgresoFacturas();
  };

  const abrirNuevo = () => {
    limpiarForm();
    titulo.textContent = 'Agregar orden de compra';
    modal.show();
  };

  const abrirEditar = (fila) => {
    titulo.textContent = 'Modificar orden de compra';
    campos.id.value = fila.dataset.id;
    campos.numeroOrden.value = fila.dataset.numeroOrden;
    campos.empresa.value = fila.dataset.empresa;
    campos.emision.value = fila.dataset.emision;
    campos.finalizacion.value = fila.dataset.finalizacion;
    campos.cantidad.value = fila.dataset.cantidad;
    campos.detalles.value = fila.dataset.detalles;

    listaFacturas.innerHTML = '';
    const facturas = JSON.parse(fila.dataset.facturas || '[]');
    facturas.forEach((f) => listaFacturas.appendChild(crearFilaFactura(f.numero, f.mesAnio)));
    actualizarProgresoFacturas();

    modal.show();
  };

  const filaHtml = (o) => {
    const emisionIso = o.fechaEmision.slice(0, 10);
    const finalizacionIso = o.fechaFinalizacion ? o.fechaFinalizacion.slice(0, 10) : '';

    const facturas = o.facturas || [];
    const facturasIso = facturas.map((f) => ({ numero: f.numero, mesAnio: f.mesAnio.slice(0, 7) }));
    const facturasTexto = facturas.length
      ? `<br><small class="text-muted">${facturasIso.map((f) => `${escapeHtml(f.numero)} (${formatoMesAnio(f.mesAnio)})`).join(', ')}</small>`
      : '';
    const estadoClase = o.estado === 'Finalizado' ? 'success' : 'warning';
    const busqueda = [o.numeroOrden, o.empresa].join(' ').toLowerCase();

    return `
    <tr
      data-id="${escapeHtml(o._id)}"
      data-numero-orden="${escapeHtml(o.numeroOrden)}"
      data-empresa="${escapeHtml(o.empresa)}"
      data-emision="${emisionIso}"
      data-finalizacion="${finalizacionIso}"
      data-detalles="${escapeHtml(o.detalles)}"
      data-cantidad="${o.cantidadFacturas}"
      data-facturas='${escapeHtml(JSON.stringify(facturasIso))}'
      data-busqueda="${escapeHtml(busqueda)}">
      <td>${escapeHtml(o.numeroOrden)}</td>
      <td>${escapeHtml(o.empresa)}</td>
      <td>${formatoFecha(emisionIso)}</td>
      <td>${formatoFecha(finalizacionIso)}</td>
      <td>${facturas.length}/${o.cantidadFacturas}${facturasTexto}</td>
      <td><span class="badge text-bg-${estadoClase}">${escapeHtml(o.estado)}</span></td>
      <td>${escapeHtml(o.detalles)}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" type="button" data-editar="${escapeHtml(o._id)}" title="Modificar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" data-eliminar="${escapeHtml(o._id)}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  };

  const cargarOrdenes = async () => {
    const res = await fetch('/api/ordenes-compra');
    const ordenes = await res.json();

    if (!res.ok) {
      throw new Error(ordenes.error || 'No se pudieron cargar las órdenes de compra');
    }

    tbody.innerHTML = ordenes.length
      ? ordenes.map(filaHtml).join('')
      : '<tr data-empty-row><td colspan="8" class="text-center text-muted py-4">No hay órdenes de compra registradas</td></tr>';

    filtrar();
  };

  const filtrar = () => {
    const texto = buscar.value.trim().toLowerCase();
    const desde = filtroDesde.value;
    const hasta = filtroHasta.value;
    const filas = [...tbody.querySelectorAll('tr')].filter((fila) => !fila.dataset.emptyRow);

    filas.forEach((fila) => {
      const coincideTexto = (fila.dataset.busqueda || '').includes(texto);
      const coincideDesde = !desde || fila.dataset.emision >= desde;
      const coincideHasta = !hasta || fila.dataset.emision <= hasta;
      fila.style.display = coincideTexto && coincideDesde && coincideHasta ? '' : 'none';
    });
  };

  document.getElementById('btnNuevaOrdenCompra').addEventListener('click', abrirNuevo);
  buscar.addEventListener('input', filtrar);
  filtroDesde.addEventListener('change', filtrar);
  filtroHasta.addEventListener('change', filtrar);

  tbody.addEventListener('click', async (event) => {
    const btnEditar = event.target.closest('[data-editar]');
    const btnEliminar = event.target.closest('[data-eliminar]');
    const fila = event.target.closest('tr');

    if (btnEditar && fila) return abrirEditar(fila);

    if (btnEliminar && fila) {
      if (!confirm(`¿Eliminar la orden de compra de ${fila.dataset.empresa}?`)) return;

      try {
        const res = await fetch(`/api/ordenes-compra/${fila.dataset.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');

        mostrarToast('Orden de compra eliminada');
        await cargarOrdenes();
      } catch (error) {
        mostrarToast(error.message, 'danger');
      }
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campos.id.value;
    const facturas = [...listaFacturas.querySelectorAll('.factura-row')].map((fila) => ({
      numero: fila.querySelector('[data-factura-numero]').value.trim(),
      mesAnio: fila.querySelector('[data-factura-mes]').value ? `${fila.querySelector('[data-factura-mes]').value}-01` : ''
    }));

    const payload = {
      numeroOrden: campos.numeroOrden.value,
      empresa: campos.empresa.value,
      fechaEmision: campos.emision.value,
      fechaFinalizacion: campos.finalizacion.value || null,
      cantidadFacturas: campos.cantidad.value,
      facturas,
      detalles: campos.detalles.value
    };

    try {
      const res = await fetch(id ? `/api/ordenes-compra/${id}` : '/api/ordenes-compra', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');

      modal.hide();
      mostrarToast(id ? 'Orden de compra actualizada' : 'Orden de compra agregada');
      await cargarOrdenes();
    } catch (error) {
      mostrarToast(error.message, 'danger');
    }
  });
});
