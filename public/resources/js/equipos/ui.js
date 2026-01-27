import { areaNombre, depNombre } from './utils.js';

export const headers = {
  equipos: `<tr><th>Área</th><th>Dependencia</th><th>Usuario PC</th><th>Código</th><th>Estado</th><th>Acciones</th></tr>`,
  traspasos: `<tr><th>Área</th><th>Dependencia</th><th>Usuario PC</th><th>Responsable</th><th>Fecha</th></tr>`,
  historial: `<tr><th>Último servicio</th><th>Código</th><th>Detalle PC</th><th>Fecha</th></tr>`
};

export function generarFilaEquipo(e) {
  const acciones = e.estado === 'ACTIVO' ? `
    <div class="btn-group btn-group-sm">
      <button class="btn btn-outline-primary" data-edit="${e._id}" data-bs-toggle="tooltip" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
      <button class="btn btn-outline-info" data-traspaso="${e._id}" data-bs-toggle="tooltip" title="Traspasar"><i class="fa-solid fa-right-left"></i></button>
      <button class="btn btn-outline-warning" data-baja="${e._id}" data-bs-toggle="tooltip" title="Dar de baja"><i class="fa-solid fa-arrow-down-wide-short"></i></button>
      <button class="btn btn-outline-secondary" data-service="${e.codigoIdentificacion}" data-id="${e._id}" data-bs-toggle="tooltip" title="Registrar service"><i class="fa-solid fa-screwdriver-wrench"></i></button>
    </div>` : '<span class="text-muted">No editable</span>';

  return `
    <tr class="${e.estado === 'BAJA' ? 'table-secondary text-muted' : ''}">
      <td>${areaNombre(e)}</td>
      <td>${depNombre(e)}</td>
      <td>${e.usernamePc} <button class="btn btn-sm btn-link text-secondary" data-detalle="${e._id}"><i class="fa-solid fa-magnifying-glass"></i></button></td>
      <td>${e.codigoIdentificacion}</td>
      <td><span class="badge rounded-pill ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">${e.estado}</span></td>
      <td>${acciones}</td>
    </tr>`;
}