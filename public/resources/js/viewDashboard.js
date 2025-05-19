document.addEventListener('DOMContentLoaded', () => {
    const configurarTabla = (config) => {
      const inputBusqueda = document.getElementById(config.busquedaId);
      const filtroFecha = document.getElementById(config.fechaId);
      const prevBtn = document.getElementById(config.prevId);
      const nextBtn = document.getElementById(config.nextId);
      const tbody = document.getElementById(config.tbodyId);
  
      const filasPorPagina = 10;
      let paginaActual = 1;
      let filasFiltradas = [];
  
      const obtenerFilas = () => [...tbody.querySelectorAll('tr')];
  
      const actualizarFiltrado = () => {
        const texto = inputBusqueda?.value.toLowerCase() || '';
        const fechaFiltro = filtroFecha?.value || '';
  
        filasFiltradas = obtenerFilas().filter(fila => {
          const coincideTexto = fila.textContent.toLowerCase().includes(texto);
          const fechaTexto = fila.querySelector('.fecha')?.dataset.fecha || '';

          const fechaFila = new Date(fechaTexto);
          const esFechaValida = !isNaN(fechaFila.getTime()); // true si es válida
          
          const coincideFecha = !fechaFiltro || (esFechaValida && fechaFila.toISOString().slice(0, 10) === fechaFiltro);
          
          return coincideTexto && coincideFecha;
        });
  
        paginaActual = 1;
        mostrarPagina();
      };
  
      const mostrarPagina = () => {
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = paginaActual * filasPorPagina;
  
        obtenerFilas().forEach(fila => (fila.style.display = 'none'));
        filasFiltradas.slice(inicio, fin).forEach(fila => (fila.style.display = ''));
  
        if (prevBtn && nextBtn) {
          prevBtn.disabled = paginaActual === 1;
          nextBtn.disabled = paginaActual * filasPorPagina >= filasFiltradas.length;
        }
      };
  
      inputBusqueda?.addEventListener('input', actualizarFiltrado);
      filtroFecha?.addEventListener('change', actualizarFiltrado);
  
      prevBtn?.addEventListener('click', () => {
        if (paginaActual > 1) {
          paginaActual--;
          mostrarPagina();
        }
      });
  
      nextBtn?.addEventListener('click', () => {
        if (paginaActual * filasPorPagina < filasFiltradas.length) {
          paginaActual++;
          mostrarPagina();
        }
      });
  
      actualizarFiltrado();
    };
  
    configurarTabla({
      busquedaId: 'busquedaSalidas',
      fechaId: 'filtroFechaSalidas',
      prevId: 'prevSalidas',
      nextId: 'nextSalidas',
      tbodyId: 'tablaSalidas'
    });
  
    configurarTabla({
      busquedaId: 'busquedaEntradas',
      fechaId: 'filtroFechaEntradas',
      prevId: 'prevEntradas',
      nextId: 'nextEntradas',
      tbodyId: 'tablaEntradas'
    });
  });
  