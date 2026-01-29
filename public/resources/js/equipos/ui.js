/* ==========================
   HELPERS DE FORMATO
========================== */
export const areaNombre = e => e.area?.nombre || '-';
export const depNombre = e => e.dependencia?.nombre || '-';
export const areaId = e => e.area?._id;
export const depId = e => e.dependencia?._id;

/* ==========================
   HEADERS DE TABLAS
========================== */
export const theadEquipos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Código</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>`;

export const theadTraspasos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Responsable</th>
      <th>Fecha</th>
    </tr>`;

export const theadHistorial = `
  <tr>
    <th>Último servicio</th>
    <th>Código</th>
    <th>Detalle PC</th>
    <th>Fecha</th>
  </tr>`;

export function initTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        bootstrap.Tooltip.getInstance(el)?.dispose();
        new bootstrap.Tooltip(el);
    });
}
export function poblarSelect(select, datosMap, placeholder = "Seleccionar") {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    datosMap.forEach((nombre, id) => {
        select.append(new Option(nombre, id));
    });
}