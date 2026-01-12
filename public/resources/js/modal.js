document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     🔔 UTILIDADES
  =============================== */
  function mostrarMensaje(titulo, texto, icono = 'success') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      timer: 2500,
      timerProgressBar: true
    });
  }

  function mostrarCargando(texto = 'Procesando...') {
    Swal.fire({
      title: texto,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  /* ===============================
     📦 DATOS
  =============================== */
  let todosLosProductos = [];

  async function cargarProductos() {
    if (todosLosProductos.length) return;
    const res = await fetch('/api/productos');
    todosLosProductos = await res.json();
  }

  function destruirSelect2(selector) {
    if ($(selector).hasClass('select2-hidden-accessible')) {
      $(selector).select2('destroy');
    }
  }

  function activarSelect2(selector, modalId) {
    $(selector).select2({
      dropdownParent: $(modalId),
      width: '100%',
      placeholder: 'Buscar producto',
      allowClear: true
    });
  }

  /* ===============================
     🆕 NUEVO PRODUCTO
  =============================== */
  const formCarga = document.getElementById('formCargaInicial');
  formCarga?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(formCarga));
    if (data.compatibilidad) {
      data.compatibilidad = data.compatibilidad.split(',').map(x => x.trim());
    }

    try {
      mostrarCargando('Guardando producto...');
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      Swal.close();
      if (!res.ok) throw await res.json();

      mostrarMensaje('Éxito', 'Producto agregado');
      formCarga.reset();
      bootstrap.Modal.getInstance(
        document.getElementById('modalCargaInicial')
      ).hide();
    } catch (err) {
      Swal.close();
      mostrarMensaje('Error', err.error || 'Error al guardar', 'error');
    }
  });

  /* ===============================
     🚚 INGRESO DE STOCK
  =============================== */
  const modalEntrada = document.getElementById('modalReabastecimiento');
  const formEntrada = document.getElementById('formEntradaStock');

  modalEntrada?.addEventListener('show.bs.modal', async () => {
    await cargarProductos();

    const selectTipo = document.getElementById('selectTipoProductoEntrada');
    const selectProducto = document.getElementById('selectProductoEntrada');

    selectTipo.innerHTML = '<option value="">Seleccionar tipo</option>';
    selectProducto.innerHTML = '';
    selectProducto.disabled = true;

    destruirSelect2('#selectProductoEntrada');

    [...new Set(todosLosProductos.map(p => p.tipo))].forEach(t => {
      selectTipo.innerHTML += `<option value="${t}">${t}</option>`;
    });
  });

  document.addEventListener('change', e => {
    if (e.target.id !== 'selectTipoProductoEntrada') return;

    const selectProducto = document.getElementById('selectProductoEntrada');
    selectProducto.innerHTML = '';
    selectProducto.disabled = true;

    const filtrados = todosLosProductos.filter(
      p => p.tipo === e.target.value
    );

    if (!filtrados.length) return;

    filtrados.forEach(p => {
      selectProducto.innerHTML += `
        <option value="${p._id}">
          ${p.marca} ${p.modelo} (${p.cantidad})
        </option>`;
    });

    selectProducto.disabled = false;
    activarSelect2('#selectProductoEntrada', '#modalReabastecimiento');
  });

  formEntrada?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(formEntrada));
    data.cantidad = parseInt(data.cantidad);

    try {
      mostrarCargando('Actualizando stock...');
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      Swal.close();
      if (!res.ok) throw await res.json();

      mostrarMensaje('Éxito', 'Stock actualizado');
      formEntrada.reset();
      bootstrap.Modal.getInstance(modalEntrada).hide();
    } catch (err) {
      Swal.close();
      mostrarMensaje('Error', err.error || 'Error al actualizar', 'error');
    }
  });

  /* ===============================
     📤 SALIDA DE STOCK
  =============================== */
  function crearLineaProducto() {
    const div = document.createElement('div');
    div.className = 'producto-linea mb-3';
    div.innerHTML = `
      <select class="form-select mb-2 tipo-producto">
        <option value="">Seleccionar tipo</option>
      </select>

      <select class="form-select mb-2 producto" disabled></select>

      <input type="number" class="form-control mb-2 cantidad" min="1" required>

      <button type="button" class="btn btn-sm btn-danger quitar-producto">Quitar</button>
      <hr>
    `;
    return div;
  }

  function inicializarLinea(div) {
    const selectTipo = div.querySelector('.tipo-producto');
    const selectProducto = div.querySelector('.producto');

    [...new Set(todosLosProductos.map(p => p.tipo))].forEach(t => {
      selectTipo.innerHTML += `<option value="${t}">${t}</option>`;
    });

    selectTipo.addEventListener('change', () => {
      selectProducto.innerHTML = '';
      selectProducto.disabled = true;

      destruirSelect2(selectProducto);

      const filtrados = todosLosProductos.filter(
        p => p.tipo === selectTipo.value && p.cantidad > 0
      );

      if (!filtrados.length) return;

      filtrados.forEach(p => {
        selectProducto.innerHTML += `
          <option value="${p._id}">
            ${p.marca} ${p.modelo} (${p.cantidad})
          </option>`;
      });

      selectProducto.disabled = false;

      activarSelect2(selectProducto, '#modalSalida');
    });

    div.querySelector('.quitar-producto').onclick = () => {
      destruirSelect2(selectProducto);
      div.remove();
    };
  }

  const modalSalida = document.getElementById('modalSalida');
  modalSalida?.addEventListener('show.bs.modal', async () => {
    await cargarProductos();
    const cont = document.getElementById('contenedorProductos');
    cont.innerHTML = '';
    const linea = crearLineaProducto();
    cont.appendChild(linea);
    inicializarLinea(linea);
  });

  document.getElementById('agregarProductoBtn')?.addEventListener('click', () => {
    const cont = document.getElementById('contenedorProductos');
    const linea = crearLineaProducto();
    cont.appendChild(linea);
    inicializarLinea(linea);
  });

  // 🔧 FIX aria-hidden + select2
['modalReabastecimiento', 'modalSalida'].forEach(id => {
  const modal = document.getElementById(id);

  modal?.addEventListener('hidden.bs.modal', () => {
    // sacar foco
    document.activeElement?.blur();

    // destruir select2 si existe
    $(modal).find('select').each(function () {
      if ($(this).hasClass('select2-hidden-accessible')) {
        $(this).select2('destroy');
      }
    });
  });
});

});
