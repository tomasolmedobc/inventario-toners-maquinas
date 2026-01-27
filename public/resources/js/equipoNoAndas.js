import { API } from './equipo/api.js';
import * as ui from './equipo/ui.js';
import * as utils from './equipo/utils.js';

// Estado global del módulo
let vistaActual = 'activos';
let equiposCache = [];
let onConfirmAction = null;

// Elementos DOM
const tbody = document.querySelector('#tablaEquipos tbody');
const thead = document.querySelector('#tablaEquipos thead');
const buscador = document.getElementById('buscador');
const selectArea = document.getElementById('selectArea');
const selectDependencia = document.getElementById('selectDependencia');

// Modales
const modales = {
  confirm: new bootstrap.Modal('#modalConfirm'),
  nuevo: new bootstrap.Modal('#modalNuevoEquipo'),
  detalle: new bootstrap.Modal('#modalDetalleEquipo'),
  editar: new bootstrap.Modal('#modalEditarEquipo'),
  traspaso: new bootstrap.Modal('#modalTraspaso')
};

/* ==========================
    LÓGICA PRINCIPAL
   ========================== */

async function cargarEquipos() {
  if (vistaActual === 'traspasos') return;
  const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';
  equiposCache = await API.getEquipos(estado);
  refrescarFiltros();
  filtrar();
}


function refrescarFiltros() {
  const aSel = selectArea.value;
  const dSel = selectDependencia.value;

  const areas = new Map();
  const deps = new Map();

  equiposCache.forEach(e => {
    if (e.area) areas.set(e.area._id, e.area.nombre);
    if (e.dependencia) deps.set(e.dependencia._id, e.dependencia.nombre);
  });

  selectArea.innerHTML = '<option value="">Todas</option>';
  selectDependencia.innerHTML = '<option value="">Todas</option>';

  areas.forEach((n, id) => selectArea.append(new Option(n, id, false, id === aSel)));
  deps.forEach((n, id) => selectDependencia.append(new Option(n, id, false, id === dSel)));
}

function filtrar() {
  const t = buscador.value.toLowerCase();
  const a = selectArea.value;
  const d = selectDependencia.value;

  const listaFiltrada = equiposCache.filter(e => 
    (!a || utils.areaId(e) === a) &&
    (!d || utils.depId(e) === d) &&
    (!t || [utils.areaNombre(e), utils.depNombre(e), e.usernamePc, e.codigoIdentificacion].some(v => v?.toLowerCase().includes(t)))
  );

  renderTabla(listaFiltrada);
}

function renderTabla(lista) {
  tbody.innerHTML = lista.length 
    ? lista.map(e => ui.generarFilaEquipo(e)).join('')
    : `<tr><td colspan="6" class="text-center text-muted">No hay datos</td></tr>`;
  utils.initTooltips();
}

/* ==========================
    EVENTOS Y MODALES
   ========================== */

tbody.onclick = async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.detalle || btn.dataset.edit || btn.dataset.traspaso || btn.dataset.baja;
  
  if (btn.dataset.detalle) mostrarDetalle(id);
  if (btn.dataset.baja) confirmarBaja(id);
  if (btn.dataset.traspaso) mostrarTraspaso(id);
};

async function mostrarDetalle(id) {
  const e = await API.getDetalle(id);
  document.getElementById('detalleEquipo').innerHTML = `
    <ul class="list-group">
      <li class="list-group-item"><b>Área:</b> ${utils.areaNombre(e)}</li>
      <li class="list-group-item"><b>Usuario:</b> ${e.usernamePc}</li>
      <li class="list-group-item"><b>Código:</b> ${e.codigoIdentificacion}</li>
    </ul>`;
  modales.detalle.show();
}

function confirmarBaja(id) {
  document.getElementById('confirmTitle').textContent = 'Dar de baja';
  document.getElementById('confirmMessage').textContent = '¿Seguro que desea dar de baja este equipo?';
  onConfirmAction = async () => {
    await API.darBaja(id);
    utils.showToast('Equipo dado de baja');
    cargarEquipos();
  };
  modales.confirm.show();
}

document.getElementById('btnConfirmar').onclick = async () => {
  if (onConfirmAction) await onConfirmAction();
  modales.confirm.hide();
};

// Exponer a Window solo lo estrictamente necesario para el HTML (si usas onclick="confirmarTraspaso()")
window.confirmarTraspaso = async function() {
  const id = document.getElementById('traspasoId').value;
  const payload = {
    area: document.getElementById('traspasoArea').value,
    dependencia: document.getElementById('traspasoDependencia').value,
    usernamePc: document.getElementById('traspasoUsernamePc').value
  };
  await API.ejecutarTraspaso(id, payload);
  modales.traspaso.hide();
  utils.showToast('Traspaso exitoso');
  cargarEquipos();
};

/* ==========================
   INICIALIZACIÓN
   ========================== */

buscador.oninput = filtrar;
thead.innerHTML = ui.headers.equipos;
cargarEquipos();