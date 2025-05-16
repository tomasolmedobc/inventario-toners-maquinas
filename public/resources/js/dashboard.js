document.addEventListener('DOMContentLoaded', () => {
    // Entradas
    const inputEntradas = document.getElementById('busquedaEntradas');
    if (inputEntradas) {
      inputEntradas.addEventListener('input', () => {
        filtrarTablaPorTexto('busquedaEntradas', 'tablaEntradas');
      });
    }
  
    const filtroFechaEntradas = document.getElementById('filtroFechaEntradas');
    if (filtroFechaEntradas) {
      filtroFechaEntradas.addEventListener('change', () => {
        filtrarTablaPorFecha('filtroFechaEntradas', 'tablaEntradas');
      });
    }
  
    const exportarEntradas = document.getElementById('btnExportarEntradas');
    if (exportarEntradas) {
      exportarEntradas.addEventListener('click', () => {
        exportTableToCSV('tablaEntradas', 'entradas.csv');
      });
    }
  
    // Salidas
    const inputSalidas = document.getElementById('busquedaSalidas');
    if (inputSalidas) {
      inputSalidas.addEventListener('input', () => {
        filtrarTablaPorTexto('busquedaSalidas', 'tablaSalidas');
      });
    }
  
    const filtroFechaSalidas = document.getElementById('filtroFechaSalidas');
    if (filtroFechaSalidas) {
      filtroFechaSalidas.addEventListener('change', () => {
        filtrarTablaPorFecha('filtroFechaSalidas', 'tablaSalidas');
      });
    }
  
    const exportarSalidas = document.getElementById('btnExportarSalidas');
    if (exportarSalidas) {
      exportarSalidas.addEventListener('click', () => {
        exportTableToCSV('tablaSalidas', 'salidas.csv');
      });
    }
  });
  