document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('busqueda');
    const filtroFecha = document.getElementById('filtroFecha');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const tbody = document.getElementById('tablaEntregas');
  
    const filasPorPagina = 10;
    let paginaActual = 1;
    let filasFiltradas = [];
  
    const obtenerFilas = () => [...tbody.querySelectorAll('tr')];
  
    const actualizarFiltrado = () => {
      const texto = inputBusqueda.value.toLowerCase();
      const fechaFiltro = filtroFecha.value;
  
      filasFiltradas = obtenerFilas().filter(fila => {
        const coincideTexto = fila.textContent.toLowerCase().includes(texto);
  
        const fechaTexto = fila.cells[6]?.textContent || '';
        const fechaFila = new Date(fechaTexto);
        const coincideFecha = !fechaFiltro || fechaFila.toISOString().slice(0, 10) === fechaFiltro;
  
        return coincideTexto && coincideFecha;
      });
  
      paginaActual = 1;
      mostrarPagina();
    };
  
    const mostrarPagina = () => {
      const inicio = (paginaActual - 1) * filasPorPagina;
      const fin = paginaActual * filasPorPagina;
  
      obtenerFilas().forEach(fila => (fila.style.display = 'none'));
  
      filasFiltradas.slice(inicio, fin).forEach(fila => {
        fila.style.display = '';
      });
  
      prevBtn.disabled = paginaActual === 1;
      nextBtn.disabled = paginaActual * filasPorPagina >= filasFiltradas.length;
    };
  
    inputBusqueda.addEventListener('input', actualizarFiltrado);
    filtroFecha.addEventListener('change', actualizarFiltrado);
  
    prevBtn.addEventListener('click', () => {
      if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina();
      }
    });
  
    nextBtn.addEventListener('click', () => {
      if (paginaActual * filasPorPagina < filasFiltradas.length) {
        paginaActual++;
        mostrarPagina();
      }
    });
  
    actualizarFiltrado(); 
  });
  