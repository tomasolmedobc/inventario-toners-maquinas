export const areaNombre = e => e.area?.nombre || '-';
export const depNombre = e => e.dependencia?.nombre || '-';
export const areaId = e => e.area?._id;
export const depId = e => e.dependencia?._id;

export function showToast(msg) {
  const toastEl = document.getElementById('toastOk');
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

export function initTooltips() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    bootstrap.Tooltip.getInstance(el)?.dispose();
    new bootstrap.Tooltip(el);
  });
}