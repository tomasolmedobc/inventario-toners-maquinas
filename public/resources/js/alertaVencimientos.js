document.addEventListener('DOMContentLoaded', () => {
  const cont = document.getElementById('alertaVencimientos');
  if (!cont) return;

  const DELAY_INICIAL_MS = 4000;
  const DURACION_VISIBLE_MS = 12000;
  const INTERVALO_ENTRE_CICLOS_MS = 60000;
  const DIAS_UMBRAL_ALERTA = 15;
  const DIAS_UMBRAL_URGENTE = 5;

  const body = document.getElementById('avBody');
  const btnCerrar = cont.querySelector('.av-cerrar');
  let timerActual = null;

  const escapeHtml = (valor) => String(valor || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const mostrar = () => {
    cont.classList.remove('d-none');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => cont.classList.add('av-visible'));
    });
  };

  const ocultar = () => {
    cont.classList.remove('av-visible');
    setTimeout(() => cont.classList.add('d-none'), 250);
  };

  const detenerCiclo = () => {
    clearTimeout(timerActual);
  };

  btnCerrar?.addEventListener('click', () => {
    detenerCiclo();
    ocultar();
    sessionStorage.setItem('alertaVencimientosCerrada', '1');
  });

  const diasRestantes = (fechaIso) => {
    const hoy = new Date();
    const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const f = new Date(fechaIso);
    const fUTC = Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
    return Math.round((fUTC - hoyUTC) / 86400000);
  };

  const obtenerUrgentes = async () => {
    const res = await fetch('/api/vencimientos');
    if (!res.ok) return [];
    const vencimientos = await res.json();

    return vencimientos.filter((v) => {
      if (v.pagado) return false;
      return diasRestantes(v.proximoVencimiento) <= DIAS_UMBRAL_ALERTA;
    });
  };

  const ciclo = async () => {
    if (sessionStorage.getItem('alertaVencimientosCerrada')) return;

    try {
      const urgentes = await obtenerUrgentes();

      if (urgentes.length) {
        body.innerHTML = urgentes.map((v) => {
          const dias = diasRestantes(v.proximoVencimiento);
          const esUrgente = dias <= DIAS_UMBRAL_URGENTE;
          const fechaTexto = new Date(v.proximoVencimiento).toLocaleDateString('es-AR', { timeZone: 'UTC' });
          const cuando = dias < 0 ? `Venció el ${fechaTexto}` : dias === 0 ? `Vence hoy` : `Vence el ${fechaTexto} (${dias} días)`;

          return `
          <a href="/dev/vencimientos" class="av-item">
            <span class="av-item-icono" style="color:${esUrgente ? '#dc3545' : '#ffc107'}">
              <i class="fa-solid fa-circle-exclamation"></i>
            </span>
            <span class="av-item-texto">
              <strong>${escapeHtml(v.empresa)}</strong>
              <small>${cuando}</small>
            </span>
          </a>`;
        }).join('');

        mostrar();
        timerActual = setTimeout(() => {
          ocultar();
          timerActual = setTimeout(ciclo, INTERVALO_ENTRE_CICLOS_MS);
        }, DURACION_VISIBLE_MS);
        return;
      }
    } catch (error) {
      console.error('Error cargando alerta de vencimientos:', error);
    }

    timerActual = setTimeout(ciclo, INTERVALO_ENTRE_CICLOS_MS);
  };

  timerActual = setTimeout(ciclo, DELAY_INICIAL_MS);
});
