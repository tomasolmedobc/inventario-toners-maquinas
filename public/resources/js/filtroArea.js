function editar(id, nombre) {
    const nuevo = prompt('Editar área', nombre);
    if (!nuevo) return;

    fetch(`/dashboard/areas/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevo })
    }).then(() => location.reload());
}
async function normalizar(areaViejaId) {
    const select = document.getElementById(`select-${areaViejaId}`);
    const areaNuevaId = select.value;

    if (!areaNuevaId) {
        alert('Seleccioná el área correcta');
        return;
    }

    const res = await fetch('/dashboard/areas/normalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areaViejaId, areaNuevaId })
    });

    if (res.ok) {
        location.reload();
    } else {
        alert('Error al normalizar');
    }
}
