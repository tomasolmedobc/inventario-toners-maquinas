


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


async function cargarFiltros() {
  const res = await fetch('/api/equipos/filtros');
  const { areas, dependencias } = await res.json();

  selectArea.innerHTML = '<option value="">Todas</option>';
  selectDependencia.innerHTML = '<option value="">Todas</option>';

  areas.forEach(a => selectArea.append(new Option(a, a)));
  dependencias.forEach(d => selectDependencia.append(new Option(d, d)));
}

/* =========================
  MODAL EDITAR EQUIPO
========================= */
async function modalEditarEquipo(id) {
  const e = await (await fetch(`/api/equipos?detalle=${id}`)).json();

  document.getElementById('editId').value = e._id;
  document.getElementById('editProcesador').value = e.procesador || '';
  document.getElementById('editRam').value = e.ram || '';
  document.getElementById('editDisco').value = e.disco || '';
  document.getElementById('editIp').value = e.ip || '';
  document.getElementById('editHostname').value = e.hostname || '';
  document.getElementById('editUsernamePc').value = e.usernamePc || '';
  document.getElementById('editNombreApellido').value = e.nombreApellido || '';

  new bootstrap.Modal(
    document.getElementById('modalEditarEquipo')
  ).show();
}

async function guardarEdicion() {
  const id = document.getElementById('editId').value;

  const data = {
    procesador: editProcesador.value,
    ram: editRam.value,
    disco: editDisco.value,
    ip: editIp.value,
    hostname: editHostname.value,
    usernamePc: editUsernamePc.value,
    nombreApellido: editNombreApellido.value
  };

  await fetch(`/api/equipos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  bootstrap.Modal.getInstance(
    document.getElementById('modalEditarEquipo')
  ).hide();

  cargarEquipos();
}



/* ==========================
  CREAR EQUIPO
========================== */
const formNuevoEquipo = document.getElementById('formNuevoEquipo');

formNuevoEquipo.onsubmit = async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(formNuevoEquipo));

  const res = await fetch('/api/equipos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) return alert('Error al guardar el equipo');

  bootstrap.Modal.getInstance(
    document.getElementById('modalNuevoEquipo')
  ).hide();

  formNuevoEquipo.reset();
  cargarFiltros();
  cargarEquipos();
};

/* ==========================
  CARGAR EQUIPOS
========================== */
async function cargarEquipos() {
  if (vistaActual === 'traspasos') return;

  const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';

  const res = await fetch(
    `/api/equipos?estado=${estado}&area=${selectArea.value}&dependencia=${selectDependencia.value}&search=${buscador.value}`
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
  FILTROS
========================== */
function refrescarFiltros() {
  const areaActual = selectArea.value;
  const depActual = selectDependencia.value;

  const areas = [...new Set(equiposCache.map(e => e.area).filter(Boolean))];
  const deps = [...new Set(equiposCache.map(e => e.dependencia).filter(Boolean))];

  selectArea.innerHTML = '<option value="">Todas</option>';
  selectDependencia.innerHTML = '<option value="">Todas</option>';

  areas.forEach(a => {
    const opt = new Option(a, a, false, a === areaActual);
    selectArea.appendChild(opt);
  });

  deps.forEach(d => {
    const opt = new Option(d, d, false, d === depActual);
    selectDependencia.appendChild(opt);
  });
}

/* ==========================
  ACCIONES
========================== */
async function darBaja(id) {
  if (!confirm('¿Dar de baja el equipo?')) return;
  await fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' });
  cargarEquipos();
}

/* ==========================
  DETALLE
========================== */
async function verDetalle(id) {
  const e = await (await fetch(`/api/equipos?detalle=${id}`)).json();

  document.getElementById('detalleEquipo').innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><strong>Área:</strong> ${e.area}</li>
      <li class="list-group-item"><strong>Dependencia:</strong> ${e.dependencia}</li>
      <li class="list-group-item"><strong>IP:</strong> ${e.ip}</li>
      <li class="list-group-item"><strong>Hostname:</strong> ${e.hostname}</li>
      <li class="list-group-item"><strong>Usuario PC:</strong> ${e.usernamePc}</li>
      <li class="list-group-item"><strong>Responsable:</strong> ${e.nombreApellido}</li>
    </ul>
  `;

  new bootstrap.Modal(document.getElementById('modalDetalleEquipo')).show();
}

/* ==========================
  TRASPASOS
========================== */
async function abrirTraspaso(id) {
  const e = await (await fetch(`/api/equipos?detalle=${id}`)).json();

  traspasoId.value = e._id;
  traspasoArea.value = e.area;
  traspasoDependencia.value = e.dependencia;
  traspasoUsernamePc.value = e.usernamePc;
  traspasoNombreApellido.value = e.nombreApellido;

  new bootstrap.Modal(
    document.getElementById('modalTraspaso')
  ).show();
}

async function confirmarTraspaso() {
  const id = traspasoId.value;

  const data = {
    area: traspasoArea.value,
    dependencia: traspasoDependencia.value,
    usernamePc: traspasoUsernamePc.value,
    nombreApellido: traspasoNombreApellido.value
  };

  await fetch(`/api/equipos/${id}/traspaso`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  bootstrap.Modal.getInstance(
    document.getElementById('modalTraspaso')
  ).hide();

  cargarEquipos();
}

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
  UTILIDADES
========================== */
function toggleFiltros(mostrar) {
  document.querySelector('.row.mb-3').style.display = mostrar ? 'flex' : 'none';
}

function activarTab(tab) {
  document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
}

buscador.oninput = () => vistaActual !== 'traspasos' && cargarEquipos();
if (selectArea) {
  selectArea.onchange = () =>
    vistaActual !== 'traspasos' && cargarEquipos();
}

if (selectDependencia) {
  selectDependencia.onchange = () =>
    vistaActual !== 'traspasos' && cargarEquipos();
}


/* INIT */
thead.innerHTML = theadEquipos;
cargarFiltros();
cargarEquipos();