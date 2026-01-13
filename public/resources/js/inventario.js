document.addEventListener('DOMContentLoaded', () => {

    let productosPorPagina = 10;
    let paginaActual = 1;
    let ordenAscendente = true;
  
    cargarTipos();
    filtrarYMostrar();

    function cargarTipos() {
      const selectFiltro = document.getElementById('filtroTipo');
    

      selectFiltro.innerHTML = '<option value="">Todos</option>';
    
      
      const tiposSet = new Set();
    
      productos.forEach(p => {
        tiposSet.add(p.tipo); 
      });
    
  
      const tiposOrdenados = Array.from(tiposSet).sort((a, b) => a.localeCompare(b));
    
 
      tiposOrdenados.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        selectFiltro.appendChild(option);
      });
    }
    
    function mostrarProductos(productosMostrar) {
      const tbody = document.querySelector('#tablaProductos tbody');
      tbody.innerHTML = '';
  
      const inicio = (paginaActual - 1) * productosPorPagina;
      const fin = inicio + productosPorPagina;
      const productosPagina = productosMostrar.slice(inicio, fin);
  
      if (productosPagina.length === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = '<td colspan="5" class="text-center">No hay productos para mostrar</td>';
        tbody.appendChild(fila);
        return;
      }
  
      productosPagina.forEach(p => {
        const fila = document.createElement('tr');
        if (p.cantidad <= 5) fila.classList.add('table-danger'); 
        
        fila.innerHTML = `
        <td>${p.tipo}</td>
        <td>${p.marca}</td>
        
        <td>${p.modelo}</td>
        <td>
          ${p.tipo.toLowerCase() === 'toner'
              ? `<button class="btn btn-sm btn-info btn-detalle"
                  data-compat='${JSON.stringify(p.compatibilidad)}'>
                  Ver
                </button>`
              : (p.compatibilidad?.join(', ') || '-')
            }
          </td>
          <td>${p.cantidad}</td>
      `;
      
        tbody.appendChild(fila);
      });
      
  
      actualizarPaginacion(productosMostrar.length);
    }
  
    function actualizarPaginacion(totalProductos) {
      const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
  
      document.getElementById('btnAnterior').disabled = paginaActual === 1;
      document.getElementById('btnSiguiente').disabled = paginaActual === totalPaginas || totalPaginas === 0;
    }
  
    function filtrarYMostrar() {
      const tipoSeleccionado = document.getElementById('filtroTipo').value;
      const busqueda = document.getElementById('inputBusqueda').value.toLowerCase();
    
      const filtrados = productos.filter(p => {
        const cumpleTipo = tipoSeleccionado === '' || p.tipo === tipoSeleccionado;
        const cumpleBusqueda = p.marca.toLowerCase().includes(busqueda)
          || p.modelo.toLowerCase().includes(busqueda)
          || (Array.isArray(p.compatibilidad) && p.compatibilidad.join(', ').toLowerCase().includes(busqueda));
        return cumpleTipo && cumpleBusqueda;
      });
    
      mostrarProductos(filtrados);
    }
    
  
    document.getElementById('filtroTipo').addEventListener('change', () => {
      paginaActual = 1;
      filtrarYMostrar();
    });
  
    document.getElementById('inputBusqueda').addEventListener('input', () => {
      paginaActual = 1;
      filtrarYMostrar();
    });
  
    document.getElementById('btnOrdenarCantidad').addEventListener('click', () => {
      productos.sort((a, b) => {
        return ordenAscendente ? a.cantidad - b.cantidad : b.cantidad - a.cantidad;
      });
      ordenAscendente = !ordenAscendente;
      filtrarYMostrar();
    });
  
    document.getElementById('btnAnterior').addEventListener('click', () => {
      if (paginaActual > 1) {
        paginaActual--;
        filtrarYMostrar();
      }
    });
  
    document.getElementById('btnSiguiente').addEventListener('click', () => {
      const totalPaginas = Math.ceil(productos.length / productosPorPagina);
      if (paginaActual < totalPaginas) {
        paginaActual++;
        filtrarYMostrar();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-detalle')) return;
    
      const compat = JSON.parse(e.target.dataset.compat || '[]');
      const lista = document.getElementById('listaCompatibilidad');
      lista.innerHTML = '';
    
      if (!compat.length) {
        lista.innerHTML = '<li class="list-group-item">Sin compatibilidad registrada</li>';
      } else {
        compat.forEach(c => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.textContent = c;
          lista.appendChild(li);
        });
      }
    
      new bootstrap.Modal(document.getElementById('modalDetalleToner')).show();
    });
    
  });
  