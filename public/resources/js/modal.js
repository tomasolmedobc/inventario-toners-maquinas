document.addEventListener('DOMContentLoaded', () => {
  // Función para mostrar mensajes
  function mostrarMensaje(titulo, texto, icono = 'success') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: 'OK',
      timer: 2500,
      timerProgressBar: true
    });
  }

  // Función para mostrar spinner de cargando
  function mostrarCargando(mensaje = 'Guardando...') {
    Swal.fire({
      title: mensaje,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // 📦 Carga inicial (nuevo producto)
  const formCarga = document.getElementById('formCargaInicial');
  if (formCarga) {
    formCarga.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formCarga);
      const data = Object.fromEntries(formData.entries());
      data.compatibilidad = data.compatibilidad.split(',').map(x => x.trim());

      try {
        mostrarCargando('Guardando producto...');
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          Swal.close();
          mostrarMensaje('Éxito', 'Producto agregado exitosamente', 'success');
          formCarga.reset();
          const modalEl = document.getElementById('modalCargaInicial');
          bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else {
          Swal.close();
          const err = await res.json();
          mostrarMensaje('Error', err.error, 'error');
        }
      } catch (err) {
        Swal.close();
        console.error(err);
        mostrarMensaje('Error', 'Ocurrió un error al guardar el producto', 'error');
      }
    });
  }

  // 🚚 Entrada de Stock (reabastecimiento)
  const formEntrada = document.getElementById('formEntradaStock');
  if (formEntrada) {
    formEntrada.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formEntrada);
      const data = Object.fromEntries(formData.entries());
      data.tipo = 'entrada';
      data.cantidad = parseInt(data.cantidad);

      try {
        mostrarCargando('Actualizando stock...');
        const res = await fetch('/api/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          Swal.close();
          mostrarMensaje('Éxito', 'Stock reabastecido correctamente', 'success');
          formEntrada.reset();
          const modalEl = document.getElementById('modalReabastecimiento');
          bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else {
          Swal.close();
          const err = await res.json();
          mostrarMensaje('Error', err.error, 'error');
        }
      } catch (err) {
        Swal.close();
        console.error(err);
        mostrarMensaje('Error', 'Ocurrió un error al reabastecer', 'error');
      }
    });
  }

  // 📤 Salida de Stock
  const formSalida = document.getElementById('formSalidaStock');
  if (formSalida) {
    formSalida.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formSalida);
      const data = Object.fromEntries(formData.entries());
      data.tipo = 'salida';
      data.cantidad = parseInt(data.cantidad);

      try {
        mostrarCargando('Registrando salida...');
        const res = await fetch('/api/movimientos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          Swal.close();
          mostrarMensaje('Éxito', 'Salida registrada correctamente', 'success');
          formSalida.reset();
          const modalEl = document.getElementById('modalSalida');
          bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else {
          Swal.close();
          const err = await res.json();
          mostrarMensaje('Error', err.error, 'error');
        }
      } catch (err) {
        Swal.close();
        console.error(err);
        mostrarMensaje('Error', 'Ocurrió un error al registrar salida', 'error');
      }
    });
  }

  // 🛒 Cargar productos dinámicamente al abrir modales
  let todosLosProductos = [];

  async function cargarProductos() {
    try {
      const res = await fetch('/api/productos');
      todosLosProductos = await res.json();

      const tiposUnicos = [...new Set(todosLosProductos.map(p => p.tipo))];

      const selectTipoSalida = document.getElementById('selectTipoProducto');
      const selectTipoEntrada = document.getElementById('selectTipoProductoEntrada');

      if (selectTipoSalida) {
        selectTipoSalida.innerHTML = '<option value="">Seleccionar tipo de producto</option>';
        tiposUnicos.forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo;
          option.textContent = tipo;
          selectTipoSalida.appendChild(option);
        });
      }

      if (selectTipoEntrada) {
        selectTipoEntrada.innerHTML = '<option value="">Seleccionar tipo de producto</option>';
        tiposUnicos.forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo;
          option.textContent = tipo;
          selectTipoEntrada.appendChild(option);
        });
      }
    } catch (err) {
      console.error('Error al cargar productos', err);
    }
  }

  function cargarProductosPorTipo(tipoSeleccionado, idSelectProducto) {
    const selectProducto = document.getElementById(idSelectProducto);
    selectProducto.innerHTML = '';

    const productosFiltrados = todosLosProductos.filter(p => p.tipo === tipoSeleccionado);

    if (productosFiltrados.length > 0) {
      selectProducto.disabled = false;
      productosFiltrados.forEach(p => {
        const option = document.createElement('option');
        option.value = p._id;
        option.textContent = `${p.marca} ${p.modelo} (${p.cantidad})`;
        selectProducto.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.textContent = 'No hay productos disponibles';
      option.disabled = true;
      selectProducto.appendChild(option);
      selectProducto.disabled = true;
    }
  }

  // Eventos para detectar cambios
  const selectTipoSalida = document.getElementById('selectTipoProducto');
  if (selectTipoSalida) {
    selectTipoSalida.addEventListener('change', (e) => {
      cargarProductosPorTipo(e.target.value, 'selectProducto');
    });
  }

  const selectTipoEntrada = document.getElementById('selectTipoProductoEntrada');
  if (selectTipoEntrada) {
    selectTipoEntrada.addEventListener('change', (e) => {
      cargarProductosPorTipo(e.target.value, 'selectProductoEntrada');
    });
  }

  // Cuando abren los modales
  const modales = ['modalReabastecimiento', 'modalSalida'];
  modales.forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('show.bs.modal', cargarProductos);
    }
  });

});
