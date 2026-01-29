export const Modales = {
    nuevo: new bootstrap.Modal(document.getElementById('modalNuevoEquipo')),
    detalle: new bootstrap.Modal(document.getElementById('modalDetalleEquipo')),
    editar: new bootstrap.Modal(document.getElementById('modalEditarEquipo')),
    traspaso: new bootstrap.Modal(document.getElementById('modalTraspaso')),
    confirm: new bootstrap.Modal(document.getElementById('modalConfirm')),
    toast: new bootstrap.Toast('#toastOk')
};

export function showToast(msg) {
    document.getElementById('toastMsg').textContent = msg;
    Modales.toast.show();
}

let onConfirmAction = null;
export function confirmar({ titulo, mensaje, onConfirm }) {
    document.getElementById('confirmTitle').textContent = titulo;
    document.getElementById('confirmMessage').textContent = mensaje;
    onConfirmAction = onConfirm;
    Modales.confirm.show();
}

document.getElementById('btnConfirmar').onclick = async () => {
    if (onConfirmAction) await onConfirmAction();
    Modales.confirm.hide();
    onConfirmAction = null;
};