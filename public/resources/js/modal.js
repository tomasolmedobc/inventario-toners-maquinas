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

  // 📤 Salida de Stock (múltiples productos)
const formSalida = document.getElementById('formSalidaStock');
if (formSalida) {
  formSalida.addEventListener('submit', async (e) => {
    e.preventDefault();

    const area = formSalida.querySelector('input[name="area"]').value.trim();
    const observacion = formSalida.querySelector('input[name="observacion"]').value.trim();

    const lineas = formSalida.querySelectorAll('.producto-linea');
    const productos = [];

    for (const linea of lineas) {
      const selectProducto = linea.querySelector('.producto');
      const inputCantidad = linea.querySelector('.cantidad');

      const productoId = selectProducto.value;
      const cantidad = parseInt(inputCantidad.value);

      if (!productoId || isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('Error', 'Verificá que todos los productos y cantidades sean válidos', 'error');
        return;
      }

      productos.push({ producto: productoId, cantidad });
    }

    const data = {
      tipo: 'salida',
      productos,
      area,
      observacion
    };

    try {
      mostrarCargando('Registrando salida...');
      const res = await fetch('/api/movimientos-multiples', {
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
        mostrarMensaje('Error', err.error || 'Datos inválidos', 'error');
      }
    } catch (err) {
      Swal.close();
      console.error(err);
      mostrarMensaje('Error', 'Ocurrió un error al registrar la salida', 'error');
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

  function crearLineaProducto(index) {
    const div = document.createElement('div');
    div.classList.add('producto-linea', 'mb-2');
    div.innerHTML = `
      <select class="form-select tipo-producto" required>
        <option value="">Seleccionar tipo de producto</option>
      </select>
      <select class="form-select producto" required disabled>
        <option value="">Seleccionar producto</option>
      </select>
      <input type="number" class="form-control cantidad" placeholder="Cantidad" required min="1">
      <button type="button" class="btn btn-danger btn-sm mt-1 quitar-producto">Quitar</button>
      <hr>
    `;
    return div;
  }
  
  function inicializarLinea(div) {
    const selectTipo = div.querySelector('.tipo-producto');
    const selectProducto = div.querySelector('.producto');
    const btnQuitar = div.querySelector('.quitar-producto');
  
    // Llenar select tipo
    const tiposUnicos = [...new Set(todosLosProductos.map(p => p.tipo))];
    tiposUnicos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipo;
      selectTipo.appendChild(option);
    });
  
    selectTipo.addEventListener('change', () => {
      const tipo = selectTipo.value;
      selectProducto.innerHTML = '';
      const filtrados = todosLosProductos.filter(p => p.tipo === tipo);
  
      if (filtrados.length > 0) {
        selectProducto.disabled = false;
        filtrados.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p._id;
          opt.textContent = `${p.marca} ${p.modelo} (${p.cantidad})`;
          selectProducto.appendChild(opt);
        });
      } else {
        selectProducto.innerHTML = '<option disabled>No hay disponibles</option>';
        selectProducto.disabled = true;
      }
    });
  
    btnQuitar.addEventListener('click', () => div.remove());
  }
      
      document.getElementById('agregarProductoBtn').addEventListener('click', () => {
        const container = document.getElementById('contenedorProductos');
        const div = crearLineaProducto();
        container.appendChild(div);
        inicializarLinea(div);
      });
      
      // Inicial al abrir modal
      document.getElementById('modalSalida').addEventListener('show.bs.modal', async () => {
        await cargarProductos(); // Asegura que todosLosProductos esté cargado
      
        const container = document.getElementById('contenedorProductos');
        container.innerHTML = '';
        const div = crearLineaProducto();
        container.appendChild(div);
        inicializarLinea(div);
      })

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

  // Ocultar anuladas por defecto si el switch está destildado
document.querySelectorAll('#tablaEntregas tr.table-danger').forEach(fila => {
  fila.style.display = 'none';
});


  // // Cuando abren los modales
  // const modales = ['modalReabastecimiento', 'modalSalida'];
  // modales.forEach(id => {
  //   const modal = document.getElementById(id);
  //   if (modal) {
  //     modal.addEventListener('show.bs.modal', cargarProductos);
  //   }
  // });

});
