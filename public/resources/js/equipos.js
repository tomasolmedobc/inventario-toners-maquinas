let vistaActual = 'activos'; // activos | bajas | traspasos
let equiposCache = [];


//let estadoActual = 'alta';
const tbody = document.querySelector('#tablaEquipos tbody');
const buscador = document.getElementById('buscador');
const selectArea = document.getElementById('selectArea');
const tabActivos = document.getElementById('tabActivos');
const tabBajas = document.getElementById('tabBajas');
const selectDependencia = document.getElementById('selectDependencia');
const tabTraspasos = document.getElementById('tabTraspasos');



/* ==========================
        CREAR EQUIPOS
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

  if (!res.ok) {
    alert('Error al guardar el equipo');
    return;
  }

  bootstrap.Modal.getInstance(
    document.getElementById('modalNuevoEquipo')
  ).hide();

  formNuevoEquipo.reset();
  cargarEquipos();
};






/* ==========================
        CARGAR EQUIPOS
========================== */
async function cargarEquipos() {
  if (vistaActual === 'traspasos') return;

  const area = selectArea.value;
  const dependencia = selectDependencia.value;
  const search = buscador.value;

  const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';

  const res = await fetch(
    `/api/equipos?estado=${estado}&area=${area}&dependencia=${dependencia}&search=${search}`
  );

  equiposCache = await res.json();

  tbody.innerHTML = '';

  if (equiposCache.length === 0) {

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
          ${e.maquina}
          <button class="btn btn-sm btn-link" onclick="verDetalle('${e._id}')">🔍</button>
        </td>
        <td>${e.codigoIdentificacion}</td>
        <td>
          <span class="badge ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
            ${e.estado}
          </span>
        </td>
        <td>
          ${e.estado === 'ACTIVO'
            ? `
              <button class="btn btn-sm btn-primary" onclick="abrirEditar('${e._id}')">✏️</button>
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
  ACCIONES
========================== */
async function refrescarFiltros() {
  const areaActual = selectArea.value;
  const depActual = selectDependencia.value;

  const areas = [...new Set(equiposCache.map(e => e.area).filter(Boolean))];
  const deps = [...new Set(equiposCache.map(e => e.dependencia).filter(Boolean))];

  selectArea.innerHTML = '<option value="">Todas</option>';
  selectDependencia.innerHTML = '<option value="">Todas</option>';

  areas.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    if (a === areaActual) opt.selected = true;
    selectArea.appendChild(opt);
  });

  deps.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    if (d === depActual) opt.selected = true;
    selectDependencia.appendChild(opt);
  });
}



async function darBaja(id) {
  if (!confirm('¿Dar de baja el equipo?')) return;
  await fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' });
  cargarEquipos();
}

async function eliminarEquipo(id) {
  if (!confirm('¿Eliminar definitivamente el equipo?')) return;
  await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
  cargarEquipos();
}

/* ==========================
  DETALLE
========================== */
async function verDetalle(id) {
  const res = await fetch(`/api/equipos?detalle=${id}`);
  const e = await res.json();

  document.getElementById('detalleEquipo').innerHTML = `
  <ul class="list-group">
    <li class="list-group-item"><strong>Área:</strong> ${e.area}</li>
    <li class="list-group-item"><strong>Dependencia:</strong> ${e.dependencia}</li>
    <li class="list-group-item"><strong>Procesador:</strong> ${e.procesador}</li>
    <li class="list-group-item"><strong>RAM:</strong> ${e.ram}</li>
    <li class="list-group-item"><strong>Disco:</strong> ${e.disco}</li>
    <li class="list-group-item"><strong>IP:</strong> ${e.ip}</li>
    <li class="list-group-item"><strong>Hostname:</strong> ${e.hostname}</li>
    <li class="list-group-item"><strong>Usuario:</strong> ${e.usuario}</li>
  </ul>
`;


  new bootstrap.Modal(document.getElementById('modalDetalleEquipo')).show();
}


/* ==========================
  EDITAR
========================== */
async function abrirEditar(id) {
  const res = await fetch(`/api/equipos?detalle=${id}`);
  const e = await res.json();

  document.getElementById('editId').value = e._id;
  document.getElementById('editProcesador').value = e.procesador || '';
  document.getElementById('editRam').value = e.ram || '';
  document.getElementById('editDisco').value = e.disco || '';
  document.getElementById('editIp').value = e.ip || '';
  document.getElementById('editHostname').value = e.hostname || '';
  document.getElementById('editUsuario').value = e.usuario || '';

  new bootstrap.Modal(
    document.getElementById('modalEditarEquipo')
  ).show();
}

async function guardarEdicion() {
  const id = document.getElementById('editId').value;

  const data = {
    procesador: document.getElementById('editProcesador').value,
    ram: document.getElementById('editRam').value,
    disco: document.getElementById('editDisco').value,
    ip: document.getElementById('editIp').value,
    hostname: document.getElementById('editHostname').value,
    usuario: document.getElementById('editUsuario').value
  };

  const res = await fetch(`/api/equipos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    alert('No se pudo editar el equipo');
    return;
  }

  bootstrap.Modal.getInstance(
    document.getElementById('modalEditarEquipo')
  ).hide();

  cargarEquipos();
}
/* ==========================
  Traspaso de area
========================== */

async function abrirTraspaso(id) {
  const res = await fetch(`/api/equipos?detalle=${id}`);
  const e = await res.json();

  document.getElementById('traspasoId').value = e._id;
  document.getElementById('traspasoArea').value = e.area;
  document.getElementById('traspasoDependencia').value = e.dependencia;
  document.getElementById('traspasoCodigo').value = e.codigoIdentificacion;

  new bootstrap.Modal(
    document.getElementById('modalTraspaso')
  ).show();
}

async function confirmarTraspaso() {
  const id = document.getElementById('traspasoId').value;

  const data = {
    area: document.getElementById('traspasoArea').value,
    dependencia: document.getElementById('traspasoDependencia').value,
    codigoIdentificacion: document.getElementById('traspasoCodigo').value
  };

  if (!confirm('¿Confirmar traspaso del equipo?')) return;

  const res = await fetch(`/api/equipos/${id}/traspaso`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    alert('No se pudo realizar el traspaso');
    return;
  }

  bootstrap.Modal.getInstance(
    document.getElementById('modalTraspaso')
  ).hide();

  cargarEquipos();
}

async function cargarTraspasos() {
  const res = await fetch('/api/equipos-traspasos');
  const traspasos = await res.json();

  tbody.innerHTML = '';

  if (traspasos.length === 0) {
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
        <td>${t.equipo?.maquina || '-'}</td>
        <td>${t.codigoAnterior} → ${t.codigoNuevo}</td>
        <td>${new Date(t.fecha).toLocaleString()}</td>
      </tr>
    `;
  });
}



/* ==========================
  EVENTOS
========================== */
function resetFiltros() {
  buscador.value = '';
  selectArea.value = '';
  selectDependencia.value = '';
}


tabTraspasos.onclick = () => {
  vistaActual = 'traspasos';
  activarTab(tabTraspasos);
  toggleFiltros(false);
  cargarTraspasos();
};

tabActivos.onclick = () => {
  vistaActual = 'activos';
  activarTab(tabActivos);
  toggleFiltros(true);
  resetFiltros();
  cargarEquipos();
};

tabBajas.onclick = () => {
  vistaActual = 'bajas';
  activarTab(tabBajas);
  resetFiltros();
  cargarEquipos();
};




function toggleFiltros(mostrar) {
  document.querySelector('.row.mb-3').style.display = mostrar ? 'flex' : 'none';
}

function activarTab(tab) {
  document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
}
buscador.oninput = () => {
  if (vistaActual !== 'traspasos') cargarEquipos();
};

selectArea.onchange = () => {
  if (vistaActual !== 'traspasos') cargarEquipos();
};

selectDependencia.onchange = () => {
  if (vistaActual !== 'traspasos') cargarEquipos();
};


/* INIT */
cargarEquipos();
