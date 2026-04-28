export function showToast(msg, tipo = 'success') {
    const toastEl = document.getElementById('toastOk');
    const toastMsg = document.getElementById('toastMsg');

    toastEl.className = `toast text-bg-${tipo} border-0`;
    toastMsg.innerText = msg;

    new bootstrap.Toast(toastEl).show();
}