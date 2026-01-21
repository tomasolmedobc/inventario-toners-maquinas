document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     🔔 UTILIDADES
  =============================== */
  const mostrarMensaje = (titulo, texto, icono = 'success') => {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      timer: 2500,
      timerProgressBar: true
    });
  };

  const mostrarCargando = (texto = 'Procesando...') => {
    Swal.fire({
      title: texto,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  };

  /* ===============================
     🔧 FIX GLOBAL MODALES
  =============================== */
  document.addEventListener('hidden.bs.modal', () => {
    document.activeElement?.blur();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
  });

  /* ===============================
     📦 DATOS EN MEMORIA
  =============================== */
  let productos = [];
  let areas = [];

  const cargarProductos = async () => {
    if (productos.length) return;
    const res = await fetch('/api/productos');
    productos = await res.json();
  };

  const cargarAreas = async () => {
    if (areas.length) return;
    const res = await fetch('/api/areas');
    areas = await res.json();

    const select = document.getElementById('selectAreaSalida');
    select.innerHTML = '<option value="">Seleccionar área</option>';

    areas.forEach(a => {
      select.innerHTML += `<option value="${a._id}">${a.nombre}</option>`;
    });

    $(select).select2({
      dropdownParent: $('#modalSalida'),
      width: '100%',
      placeholder: 'Buscar área',
      allowClear: true
    });
  };

  const destruirSelect2 = (el) => {
    if ($(el).hasClass('select2-hidden-accessible')) {
      $(el).select2('destroy');
    }
  };

  const activarSelect2 = (el, modalId) => {
    $(el).select2({
      dropdownParent: $(modalId),
      width: '100%',
      allowClear: true
    });
  };

  /* ===============================
     🆕 NUEVO PRODUCTO
  =============================== */
  const formProducto = document.getElementById('formCargaInicial');

  formProducto?.addEventListener('submit', async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(formProducto));
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

      formProducto.reset();
      bootstrap.Modal.getInstance(
        document.getElementById('modalCargaInicial')
      ).hide();

      setTimeout(() => {
        mostrarMensaje('Éxito', 'Producto agregado');
      }, 200);

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

    const tipo = document.getElementById('selectTipoProductoEntrada');
    const prod = document.getElementById('selectProductoEntrada');

    tipo.innerHTML = '<option value="">Seleccionar tipo</option>';
    prod.innerHTML = '';
    prod.disabled = true;

    destruirSelect2(prod);

    [...new Set(productos.map(p => p.tipo))].forEach(t => {
      tipo.innerHTML += `<option value="${t}">${t}</option>`;
    });
  });

  document.addEventListener('change', e => {
    if (e.target.id !== 'selectTipoProductoEntrada') return;

    const prod = document.getElementById('selectProductoEntrada');
    prod.innerHTML = '';
    prod.disabled = true;

    const filtrados = productos.filter(p => p.tipo === e.target.value);
    if (!filtrados.length) return;

    filtrados.forEach(p => {
      prod.innerHTML += `
        <option value="${p._id}">
          ${p.marca} ${p.modelo} (${p.cantidad})
        </option>`;
    });

    prod.disabled = false;
    activarSelect2(prod, '#modalReabastecimiento');
  });

  formEntrada?.addEventListener('submit', async e => {
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

      formEntrada.reset();
      bootstrap.Modal.getInstance(modalEntrada).hide();

      setTimeout(() => {
        mostrarMensaje('Éxito', 'Stock actualizado');
      }, 200);

    } catch (err) {
      Swal.close();
      mostrarMensaje('Error', err.error || 'Error al actualizar', 'error');
    }
  });

  /* ===============================
     📤 SALIDA DE STOCK
  =============================== */
  const modalSalida = document.getElementById('modalSalida');
  const formSalida = document.getElementById('formSalidaStock');

  const crearLineaProducto = () => {
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
  };

  const initLinea = (div) => {
    const tipo = div.querySelector('.tipo-producto');
    const prod = div.querySelector('.producto');

    [...new Set(productos.map(p => p.tipo))].forEach(t => {
      tipo.innerHTML += `<option value="${t}">${t}</option>`;
    });

    tipo.addEventListener('change', () => {
      prod.innerHTML = '';
      prod.disabled = true;
      destruirSelect2(prod);

      const filtrados = productos.filter(
        p => p.tipo === tipo.value && p.cantidad > 0
      );

      if (!filtrados.length) return;

      filtrados.forEach(p => {
        prod.innerHTML += `
          <option value="${p._id}">
            ${p.marca} ${p.modelo} (${p.cantidad})
          </option>`;
      });

      prod.disabled = false;
      activarSelect2(prod, '#modalSalida');
    });

    div.querySelector('.quitar-producto').onclick = () => {
      destruirSelect2(prod);
      div.remove();
    };
  };

  modalSalida?.addEventListener('show.bs.modal', async () => {
    await cargarProductos();
    await cargarAreas();

    const cont = document.getElementById('contenedorProductos');
    cont.innerHTML = '';

    const linea = crearLineaProducto();
    cont.appendChild(linea);
    initLinea(linea);
  });

  document.getElementById('agregarProductoBtn')?.addEventListener('click', () => {
    const cont = document.getElementById('contenedorProductos');
    const linea = crearLineaProducto();
    cont.appendChild(linea);
    initLinea(linea);
  });

  formSalida?.addEventListener('submit', async e => {
    e.preventDefault();

    const area = formSalida.querySelector('[name="area"]').value;
    if (!area) {
      mostrarMensaje('Error', 'Debe indicar un área', 'error');
      return;
    }

    const productosSalida = [];
    document.querySelectorAll('.producto-linea').forEach(l => {
      const p = l.querySelector('.producto')?.value;
      const c = l.querySelector('.cantidad')?.value;
      if (p && c) productosSalida.push({ producto: p, cantidad: parseInt(c) });
    });

    if (!productosSalida.length) {
      mostrarMensaje('Error', 'Debe agregar al menos un producto', 'error');
      return;
    }

    try {
      mostrarCargando('Registrando salida...');
      const res = await fetch('/api/movimientos-multiples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'salida',
          area,
          observacion: formSalida.querySelector('[name="observacion"]').value,
          productos: productosSalida
        })
      });

      Swal.close();
      if (!res.ok) throw await res.json();

      formSalida.reset();
      bootstrap.Modal.getInstance(modalSalida).hide();

      setTimeout(() => {
        mostrarMensaje('Éxito', 'Salida registrada correctamente');
      }, 200);

    } catch (err) {
      Swal.close();
      mostrarMensaje('Error', err.error || 'Error al registrar salida', 'error');
    }
  });

});
