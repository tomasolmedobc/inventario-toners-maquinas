import * as api from './api.js';
import { areaNombre, depNombre, theadEquipos, theadHistorial, showToast } from './ui.js';

let vistaActual = 'activos';
let equiposCache = [];

// Elementos del DOM
const tbody = document.querySelector('#tablaEquipos tbody');
const thead = document.querySelector('#tablaEquipos thead');
const buscador = document.getElementById('buscador');

/* ==========================
   LÓGICA DE RENDERIZADO
   ========================== */
async function cargarEquipos() {
    const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';
    equiposCache = await api.fetchEquipos(estado);
    renderTabla(equiposCache);
}

function renderTabla(lista) {
    tbody.innerHTML = '';
    lista.forEach(e => {
        const acciones = e.estado === 'ACTIVO'
            ? `
    <div class="btn-group btn-group-sm">
      <button
        class="btn btn-outline-primary"
        data-edit="${e._id}"
         data-bs-toggle="tooltip"
        data-bs-title="Editar">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>

      <button
        class="btn btn-outline-info"
        data-traspaso="${e._id}"
         data-bs-toggle="tooltip"
        data-bs-title="Traspasar">
        <i class="fa-solid fa-right-left"></i>
      </button>

      <button
        class="btn btn-outline-warning"
        data-baja="${e._id}"
        data-bs-toggle="tooltip"
        data-bs-title="Dar de baja">
        <i class="fa-solid fa-arrow-down-wide-short"></i>
      </button>

      <button
        class="btn btn-outline-secondary"
        data-service="${e.codigoIdentificacion}"
        data-id="${e._id}"
        data-bs-toggle="tooltip"
        data-bs-title="Registrar service">
        <i class="fa-solid fa-screwdriver-wrench"></i>
  </button>

    </div>
  `
            : '<span class="text-muted">No editable</span>'


        tbody.insertAdjacentHTML('beforeend', `
    <tr class="${e.estado === 'BAJA' ? 'table-secondary text-muted' : ''}">
      <td>${areaNombre(e)}</td>
      <td>${depNombre(e)}</td>
      <td>
        ${e.usernamePc}
        <button class="btn btn-sm btn-link text-secondary" data-detalle="${e._id}">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
      </td>
      <td>${e.codigoIdentificacion}</td>
      <td>
        <span class="badge rounded-pill ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
      
          ${e.estado}
        </span>
      </td>
      <td>${acciones}</td>
    </tr>
  `)
    })
    initTooltips()
}


/* ==========================
   EVENTOS
   ========================== */
buscador.oninput = () => {
    const t = buscador.value.toLowerCase();
    const filtrados = equiposCache.filter(e =>
        areaNombre(e).toLowerCase().includes(t) ||
        e.codigoIdentificacion.toLowerCase().includes(t)
    );
    renderTabla(filtrados);
};

// Inicialización
thead.innerHTML = theadEquipos;
cargarEquipos();