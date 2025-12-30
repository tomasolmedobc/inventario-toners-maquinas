document.addEventListener('DOMContentLoaded', () => {

  let vistaActual = 'activos'; // activos | bajas | traspasos
  let equiposCache = [];

  /* ==========================
    ELEMENTOS DOM
  ========================== */
  const tbody = document.querySelector('#tablaEquipos tbody');
  const thead = document.querySelector('#tablaEquipos thead');

  const buscador = document.getElementById('buscador');
  const selectArea = document.getElementById('selectArea');
  const selectDependencia = document.getElementById('selectDependencia');

  const tabActivos = document.getElementById('tabActivos');
  const tabBajas = document.getElementById('tabBajas');
  const tabTraspasos = document.getElementById('tabTraspasos');

  if (!tbody || !thead) return;

  /* ==========================
    THEADs
  ========================== */
  const theadEquipos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Código</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  `;

  const theadTraspasos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Responsable</th>
      <th>Fecha</th>
    </tr>
  `;

  /* ==========================
    FILTROS
  ========================== */
  async function cargarFiltros() {
    if (!selectArea || !selectDependencia) return;

    const res = await fetch('/api/equipos/filtros');
    const { areas, dependencias } = await res.json();

    selectArea.innerHTML = '<option value="">Todas</option>';
    selectDependencia.innerHTML = '<option value="">Todas</option>';

    areas.forEach(a => selectArea.append(new Option(a, a)));
    dependencias.forEach(d => selectDependencia.append(new Option(d, d)));
  }

  function refrescarFiltros() {
    if (!selectArea || !selectDependencia) return;

    const areaActual = selectArea.value;
    const depActual = selectDependencia.value;

    const areas = [...new Set(equiposCache.map(e => e.area).filter(Boolean))];
    const deps = [...new Set(equiposCache.map(e => e.dependencia).filter(Boolean))];

    selectArea.innerHTML = '<option value="">Todas</option>';
    selectDependencia.innerHTML = '<option value="">Todas</option>';

    areas.forEach(a => {
      selectArea.append(new Option(a, a, false, a === areaActual));
    });

    deps.forEach(d => {
      selectDependencia.append(new Option(d, d, false, d === depActual));
    });
  }

  /* ==========================
    CARGAR EQUIPOS
  ========================== */
  async function cargarEquipos() {
    if (vistaActual === 'traspasos') return;

    const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';

    const area = selectArea ? selectArea.value : '';
    const dependencia = selectDependencia ? selectDependencia.value : '';
    const search = buscador ? buscador.value : '';

    const res = await fetch(
      `/api/equipos?estado=${estado}&area=${area}&dependencia=${dependencia}&search=${search}`
    );

    equiposCache = await res.json();
    tbody.innerHTML = '';

    if (!equiposCache.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            No hay equipos para mostrar
          </td>
        </tr>
      `;
      refrescarFiltros();
      return;
    }

    equiposCache.forEach(e => {
      tbody.innerHTML += `
        <tr class="${e.estado === 'BAJA' ? 'table-danger' : ''}">
          <td>${e.area}</td>
          <td>${e.dependencia}</td>
          <td>
            ${e.usernamePc}
            <button class="btn btn-sm btn-link" onclick="verDetalle('${e._id}')">🔍</button>
          </td>
          <td>${e.codigoIdentificacion}</td>
          <td>
            <span class="badge ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
              ${e.estado}
            </span>
          </td>
          <td>
            ${
              e.estado === 'ACTIVO'
                ? `
                  <button class="btn btn-sm btn-primary" onclick="modalEditarEquipo('${e._id}')">✏️</button>
                  <button class="btn btn-sm btn-info" onclick="abrirTraspaso('${e._id}')">🔁</button>
                  <button class="btn btn-sm btn-warning" onclick="darBaja('${e._id}')">⬇️</button>
                `
                : '<span class="text-muted">No editable</span>'
            }
          </td>
        </tr>
      `;
    });

    refrescarFiltros();
  }

  /* ==========================
    TRASPASOS
  ========================== */
  async function cargarTraspasos() {
    const res = await fetch('/api/equipos-traspasos');
    const traspasos = await res.json();

    tbody.innerHTML = '';

    if (!traspasos.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">
            No hay traspasos registrados
          </td>
        </tr>
      `;
      return;
    }

    traspasos.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.areaAnterior} → ${t.areaNueva}</td>
          <td>${t.dependenciaAnterior} → ${t.dependenciaNueva}</td>
          <td>${t.usernamePcAnterior} → ${t.usernamePcNueva}</td>
          <td>${t.nombreApellidoAnterior} → ${t.nombreApellidoNuevo}</td>
          <td>${new Date(t.fecha).toLocaleString()}</td>
        </tr>
      `;
    });
  }

  /* ==========================
    TABS
  ========================== */
  function activarTab(tab) {
    document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  }

  function toggleFiltros(mostrar) {
    const filtros = document.querySelector('.row.mb-3');
    if (filtros) filtros.style.display = mostrar ? 'flex' : 'none';
  }

  tabActivos.onclick = () => {
    vistaActual = 'activos';
    activarTab(tabActivos);
    toggleFiltros(true);
    thead.innerHTML = theadEquipos;
    cargarEquipos();
  };

  tabBajas.onclick = () => {
    vistaActual = 'bajas';
    activarTab(tabBajas);
    toggleFiltros(true);
    thead.innerHTML = theadEquipos;
    cargarEquipos();
  };

  tabTraspasos.onclick = () => {
    vistaActual = 'traspasos';
    activarTab(tabTraspasos);
    toggleFiltros(false);
    thead.innerHTML = theadTraspasos;
    cargarTraspasos();
  };

  /* ==========================
    EVENTOS
  ========================== */
  if (buscador) {
    buscador.oninput = () =>
      vistaActual !== 'traspasos' && cargarEquipos();
  }

  if (selectArea) {
    selectArea.onchange = () =>
      vistaActual !== 'traspasos' && cargarEquipos();
  }

  if (selectDependencia) {
    selectDependencia.onchange = () =>
      vistaActual !== 'traspasos' && cargarEquipos();
  }

  /* ==========================
    INIT
  ========================== */
  thead.innerHTML = theadEquipos;
  cargarFiltros();
  cargarEquipos();

});

window.verDetalle = async function (id) {
  const res = await fetch(`/api/equipos?detalle=${id}`);
  const e = await res.json();

  document.getElementById('detalleEquipo').innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><b>Área:</b> ${e.area}</li>
      <li class="list-group-item"><b>Dependencia:</b> ${e.dependencia}</li>
      <li class="list-group-item"><b>Usuario PC:</b> ${e.usernamePc}</li>
      <li class="list-group-item"><b>Código:</b> ${e.codigoIdentificacion}</li>
      <li class="list-group-item"><b>Estado:</b> ${e.estado}</li>
    </ul>
  `;

  new bootstrap.Modal('#modalDetalleEquipo').show();
};

window.darBaja = async function (id) {
  if (!confirm('¿Dar de baja este equipo?')) return;

  await fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' });
  location.reload();
};

window.modalEditarEquipo = function (id) {
  document.getElementById('editId').value = id;
  new bootstrap.Modal('#modalEditarEquipo').show();
};

window.abrirTraspaso = function (id) {
  document.getElementById('traspasoId').value = id;
  new bootstrap.Modal('#modalTraspaso').show();
};
