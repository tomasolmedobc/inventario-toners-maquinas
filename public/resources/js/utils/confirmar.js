export function confirmar({ titulo, mensaje, onConfirm }) {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirm'));
    document.getElementById('confirmTitle').innerText = titulo;
    document.getElementById('confirmMessage').innerText = mensaje;

    const btn = document.getElementById('btnConfirmar');
    btn.onclick = async () => {
        modal.hide();
        await onConfirm();
    };

    modal.show();
}
