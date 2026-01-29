import { 
    theadEquipos, theadTraspasos, theadHistorial, 
    areaNombre, depNombre, areaId, depId, initTooltips 
} from './ui.js';
import { API } from './api.js';
import { Modales, showToast, confirmar } from './modals.js';
import { FiltroManager } from './filtros.js';

/* ==========================
   ESTADO GLOBAL
========================== */
let vistaActual = 'activos';
let equiposCache = [];

/* ==========================
   ELEMENTOS DEL DOM
========================== */
const tbody = document.querySelector('#tablaEquipos tbody');
const thead = document.querySelector('#tablaEquipos thead');
const buscador = document.getElementById('buscador');
const selectArea = document.getElementById('selectArea');
const selectDependencia = document.getElementById('selectDependencia');
const formNuevoEquipo = document.getElementById('formNuevoEquipo');
const formEditarEquipo = document.getElementById('formEditarEquipo');

// Selects de los modales
const modalNuevoArea = document.getElementById('modalNuevoArea');
const modalNuevoDep = document.getElementById('modalNuevoDep');
const modalTraspasoArea = document.getElementById('traspasoArea');
const modalTraspasoDep = document.getElementById('traspasoDependencia');
const modalEditArea = document.getElementById('editArea');
const modalEditDep = document.getElementById('editDependencia');

/* ==========================
   INICIALIZACIÓN
========================== */
async function inicializar() {
    try {
        const { areas, dependencias } = await API.getFiltros();
        FiltroManager.setDatos(areas, dependencias);

        FiltroManager.poblarSelect(selectArea, areas, "Todas las áreas");
        FiltroManager.poblarSelect(modalNuevoArea, areas, "Seleccionar Área");
        FiltroManager.poblarSelect(modalTraspasoArea, areas, "Seleccionar Área");
        if (modalEditArea) FiltroManager.poblarSelect(modalEditArea, areas, "Seleccionar Área");

        await navegarA('activos', theadEquipos);
    } catch (error) {
        console.error("Error al inicializar:", error);
        showToast("Error al cargar datos iniciales", "danger");
    }
}

/* ==========================
   LÓGICA DE FILTRADO Y CARGA
========================== */
async function cargarEquipos() {
    if (vistaActual !== 'activos' && vistaActual !== 'bajas') return;
    const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA';
    equiposCache = await API.getEquipos(estado);
    ejecutarFiltrado();
}

function ejecutarFiltrado() {
    const textoBusqueda = buscador.value.trim();

    if (vistaActual === 'service') {
        if (textoBusqueda.length > 2) buscarService(textoBusqueda);
        return;
    }
    if (vistaActual === 'traspasos') return;

    const listaFiltrada = FiltroManager.aplicarFiltro(equiposCache, {
        texto: textoBusqueda,
        area: selectArea.value,
        dependencia: selectDependencia.value,
        areaIdFn: areaId,
        depIdFn: depId,
        areaNombreFn: areaNombre,
        depNombreFn: depNombre
    });
    renderTabla(listaFiltrada);
}

async function buscarService(codigo) {
    const lista = await API.getService(codigo);
    tbody.innerHTML = lista.length ? lista.map(s => `
        <tr>
            <td>${s.tipo} - ${s.descripcion}</td>
            <td>${s.codigoIdentificacion}</td>
            <td>${s.equipo?.procesador || '-'} / ${s.equipo?.ram || '-'}</td>
            <td>${new Date(s.fecha).toLocaleString()}</td>
        </tr>`).join('') : `<tr><td colspan="4" class="text-center text-muted">No se encontraron registros</td></tr>`;
}

/* ==========================
   EVENTOS DE INTERFAZ
========================== */
buscador.oninput = ejecutarFiltrado;

selectArea.onchange = () => {
    FiltroManager.configurarCascada(selectArea.value, selectDependencia, "Todas las dependencias");
    ejecutarFiltrado();
};

selectDependencia.onchange = ejecutarFiltrado;
modalNuevoArea.onchange = () => {
    FiltroManager.configurarCascada(modalNuevoArea.value, modalNuevoDep, "Seleccionar Dependencia");
};
modalTraspasoArea.onchange = () => FiltroManager.configurarCascada(modalTraspasoArea.value, modalTraspasoDep, "Seleccionar Dependencia");
if (modalEditArea) {
    modalEditArea.onchange = () => FiltroManager.configurarCascada(modalEditArea.value, modalEditDep, "Seleccionar Dependencia");
}

/* ==========================
   RENDERIZADO
========================== */
function renderTabla(lista) {
    tbody.innerHTML = '';
    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay datos coincidentes</td></tr>`;
        return;
    }

    lista.forEach(e => {
        const acciones = e.estado === 'ACTIVO' ? `
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" data-edit="${e._id}" data-bs-toggle="tooltip" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-outline-info" data-traspaso="${e._id}" data-bs-toggle="tooltip" title="Traspasar"><i class="fa-solid fa-right-left"></i></button>
                <button class="btn btn-outline-warning" data-baja="${e._id}" data-bs-toggle="tooltip" title="Dar de baja"><i class="fa-solid fa-arrow-down-wide-short"></i></button>
                <button class="btn btn-outline-secondary" data-service="${e.codigoIdentificacion}" data-bs-toggle="tooltip" title="Service"><i class="fa-solid fa-screwdriver-wrench"></i></button>
            </div>` : '<span class="badge bg-secondary">Inactivo</span>';

        tbody.insertAdjacentHTML('beforeend', `
            <tr class="${e.estado === 'BAJA' ? 'table-light text-muted' : ''}">
                <td>${areaNombre(e)}</td>
                <td>${depNombre(e)}</td>
                <td>${e.usernamePc} <button class="btn btn-sm btn-link p-0 ms-1" data-detalle="${e._id}"><i class="fa-solid fa-magnifying-glass"></i></button></td>
                <td>${e.codigoIdentificacion}</td>
                <td><span class="badge rounded-pill ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">${e.estado}</span></td>
                <td>${acciones}</td>
            </tr>`);
    });
    initTooltips();
}

function renderTablaTraspasos(lista) {
    tbody.innerHTML = lista.length ? lista.map(t => `
        <tr>
            <td>${t.areaAnterior?.nombre || '-'} → ${t.areaNueva?.nombre || '-'}</td>
            <td>${t.dependenciaAnterior?.nombre || '-'} → ${t.dependenciaNueva?.nombre || '-'}</td>
            
            <td>${t.usernamePcAnterior || '-'} → ${t.usernamePcNueva || '-'}</td>
            
            <td>${t.nombreApellidoAnterior || '-'} → ${t.nombreApellidoNuevo || '-'}</td>
            
            <td>${new Date(t.fecha).toLocaleDateString()}</td>
        </tr>`).join('') : `<tr><td colspan="5" class="text-center text-muted">Sin movimientos registrados</td></tr>`;
}
/* ==========================
   EVENTOS DE TABLA 
========================== */
tbody.onclick = async e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.detalle || btn.dataset.edit || btn.dataset.traspaso || btn.dataset.baja;
    
    if (btn.dataset.detalle) {
        const eq = await API.getDetalle(id);
        document.getElementById('detalleEquipo').innerHTML = `
            <div class="list-group list-group-flush">
                <p class="m-1"><strong>Hostname:</strong> ${eq.hostname || 'N/A'}</p>
                <p class="m-1"><strong>Nombre y Apellido:</strong> ${eq.nombreApellido || 'N/A'}</p>
                <p class="m-1"><strong>IP:</strong> ${eq.ip || 'N/A'}</p>
                <p class="m-1"><strong>Procesador:</strong> ${eq.procesador || 'N/A'}</p>
                <p class="m-1"><strong>RAM:</strong> ${eq.ram || 'N/A'}</p>
                <p class="m-1"><strong>Disco:</strong> ${eq.disco || 'N/A'}</p>
                <p class="m-1"><strong>Sistema Operativo:</strong> ${eq.sistemaOp || 'N/A'}</p>
                <p class="m-1"><strong>Codigo:</strong> ${eq.codigoIdentificacion || 'N/A'}</p>
                <p class="m-1"><strong>IP:</strong> ${eq.ip || 'N/A'}</p>
            </div>`;


        Modales.detalle.show();
    }

    if (btn.dataset.edit) {
        try {
            const eq = await API.getDetalle(id);
            document.getElementById('editId').value = id;

            // Poblar campos de texto
            Object.entries(eq).forEach(([key, value]) => {
                const input = document.getElementById(`edit${key.charAt(0).toUpperCase() + key.slice(1)}`);
                if (input && input.tagName !== 'SELECT') input.value = value || '';
            });

            // Poblar selects con cascada
            if (modalEditArea && modalEditDep) {
                modalEditArea.value = eq.area?._id || eq.area || '';
                FiltroManager.configurarCascada(modalEditArea.value, modalEditDep, "Seleccionar Dependencia");
                modalEditDep.value = eq.dependencia?._id || eq.dependencia || '';
            }
            Modales.editar.show();
        } catch (error) {
            showToast("Error al cargar datos");
        }
    }

    if (btn.dataset.traspaso) {
        const eq = await API.getDetalle(id);
        modalTraspasoArea.value = eq.area?._id || '';
        FiltroManager.configurarCascada(modalTraspasoArea.value, modalTraspasoDep, "Seleccionar Dependencia");
        modalTraspasoDep.value = eq.dependencia?._id || '';
        document.getElementById('traspasoId').value = id;
        document.getElementById('traspasoUsernamePc').value = eq.usernamePc || '';
        document.getElementById('traspasoNombreApellido').value = eq.nombreApellido || '';
        Modales.traspaso.show();
    }

    if (btn.dataset.baja) {
        confirmar({
            titulo: 'Confirmar Baja',
            mensaje: `¿Desea desactivar el equipo ${id}?`,
            onConfirm: async () => {
                await API.darBaja(id);
                showToast('Equipo desactivado');
                cargarEquipos();
            }
        });
    }
};

/* ==========================
   NAVEGACIÓN Y FORMULARIOS
========================== */
const navegarA = async (vista, headerHtml) => {
    vistaActual = vista;
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.id === `tab${vista.charAt(0).toUpperCase() + vista.slice(1)}` || (vista === 'service' && link.id === 'tabService'));
    });

    const esInventario = (vista === 'activos' || vista === 'bajas');
    selectArea.disabled = !esInventario;
    selectDependencia.disabled = !esInventario;

    thead.innerHTML = headerHtml;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div> Cargando...</td></tr>';

    if (esInventario) await cargarEquipos();
    else if (vista === 'traspasos') renderTablaTraspasos(await API.getTraspasos());
    else if (vista === 'service') tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Ingrese código para buscar</td></tr>`;
};

document.getElementById('tabActivos').onclick = () => navegarA('activos', theadEquipos);
document.getElementById('tabBajas').onclick = () => navegarA('bajas', theadEquipos);
document.getElementById('tabTraspasos').onclick = () => navegarA('traspasos', theadTraspasos);
document.getElementById('tabService').onclick = () => navegarA('service', theadHistorial);

formEditarEquipo?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const data = Object.fromEntries(new FormData(formEditarEquipo));
    if ((await API.actualizarEquipo(id, data)).ok) {
        Modales.editar.hide();
        showToast('Equipo actualizado');
        cargarEquipos();
    }
});
/* Reemplaza tu bloque de formNuevoEquipo por este */
formNuevoEquipo?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const data = Object.fromEntries(new FormData(formNuevoEquipo));
        const res = await API.crearEquipo(data);

        if (res.ok) {
            Modales.nuevo.hide(); // Cerramos el modal correctamente
            formNuevoEquipo.reset(); // Limpiamos los campos
            showToast('Equipo creado con éxito');
            await cargarEquipos(); // Refrescamos la lista
        } else {
            const error = await res.json();
            alert('Error: ' + (error.message || 'No se pudo crear el equipo'));
        }
    } catch (err) {
        console.error(err);
        showToast('Error de conexión al crear equipo', 'danger');
    }
});

window.confirmarTraspaso = async function () {
    const id = document.getElementById('traspasoId').value;
    const payload = Object.fromEntries(new FormData(document.getElementById('formTraspaso')));
    
    if ((await API.realizarTraspaso(id, payload)).ok) {
        Modales.traspaso.hide();
        showToast('Traspaso exitoso');
        
        // Si estamos en la vista de traspasos, refrescar esa tabla
        if (vistaActual === 'traspasos') {
            renderTablaTraspasos(await API.getTraspasos());
        } else {
            await cargarEquipos(); // Si estamos en inventario, refrescar inventario
        }
    }
};
window.guardarEdicion = async function() {
    const form = document.getElementById('formEditarEquipo');
    const id = document.getElementById('editId').value; // Extrae el ID del input hidden
    
    const data = Object.fromEntries(new FormData(form));
    
    try {
        // Llamada corregida: pasamos ID y DATA por separado
        const res = await API.actualizarEquipo(id, data); 
        
        if (res.ok) {
            Modales.editar.hide();
            showToast('Equipo actualizado con éxito');
            await cargarEquipos(); 
        } else {
            const errorData = await res.json();
            showToast(errorData.message || 'Error al actualizar', 'danger');
        }
    } catch (error) {
        console.error(error);
        showToast('Error de conexión', 'danger');
    }
};
inicializar();