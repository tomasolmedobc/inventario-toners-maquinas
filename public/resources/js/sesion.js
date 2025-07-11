document.addEventListener('DOMContentLoaded', () => {
  const DURACION_SESION_MS = 2 * 60 * 60 * 1000; // 2 horas
  const AVISO_ANTES_MS = 5 * 60 * 1000; // 5 minutos antes
  const TIEMPO_RESPUESTA_MS = 30 * 1000; // 30 segundos para responder el modal

  let tiempoInicio = Date.now();
  let verificador;
  let timeoutAutoCerrar = null;

  function mostrarModalSesion() {
    const modalElement = document.getElementById('modalSesion');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Configurar timeout para cerrar sesión automáticamente
    timeoutAutoCerrar = setTimeout(() => {
      window.location.href = '/auth/logout';
    }, TIEMPO_RESPUESTA_MS);

    // Botón "Sí, mantener activa"
    document.getElementById('mantenerSesion').onclick = () => {
      fetch('/api/ping-sesion').then(() => {
        tiempoInicio = Date.now(); // Reiniciar contador
        modal.hide();
        clearTimeout(timeoutAutoCerrar);
        verificador = setInterval(verificarSesion, 10000);
      });
    };

    // Botón "No"
    document.getElementById('cerrarSesion').onclick = () => {
      clearTimeout(timeoutAutoCerrar);
      window.location.href = '/auth/logout';
    };
  }

  function verificarSesion() {
    const tiempoPasado = Date.now() - tiempoInicio;

    if (tiempoPasado >= DURACION_SESION_MS - AVISO_ANTES_MS) {
      clearInterval(verificador);
      mostrarModalSesion();
    }
  }

  verificador = setInterval(verificarSesion, 10000); // cada 10 segundos
});
