(() => {
    const modalEl = document.getElementById('modalDependencia')
    const modal = new bootstrap.Modal(modalEl, { backdrop: 'static' })
    const form = document.getElementById('formDependencia')

    const depId = document.getElementById('depId')
    const depAreaId = document.getElementById('depAreaId')
    const depAreaNombre = document.getElementById('depAreaNombre')
    const depNombre = document.getElementById('depNombre')
    const titulo = document.getElementById('tituloModalDependencia')
    const buscador = document.getElementById('buscadorAreas')

    let modo = 'crear' // crear | editar

    /* ===============================
       ABRIR MODAL NUEVA
    =============================== */
    window.abrirModalDependencia = (areaId, areaNombre) => {
        modo = 'crear'
        depId.value = ''
        depAreaId.value = areaId
        depAreaNombre.value = areaNombre
        depNombre.value = ''
        titulo.textContent = 'Nueva Dependencia'
        modal.show()
    }

    /* ===============================
       ABRIR MODAL EDITAR
    =============================== */
    window.editarDependencia = (id, nombreActual, areaNombre) => {
        modo = 'editar'
        depId.value = id
        depNombre.value = nombreActual
        depAreaNombre.value = areaNombre
        titulo.textContent = 'Editar Dependencia'
        modal.show()
    }

    /* ===============================
       SUBMIT
    =============================== */
    form.addEventListener('submit', async e => {
        e.preventDefault()

        const nombre = depNombre.value.trim()
        if (!nombre) return showToast('Ingresá un nombre', 'warning')

        const url =
            modo === 'crear'
                ? '/api/dependencias'
                : `/api/dependencias/${depId.value}`

        const method = modo === 'crear' ? 'POST' : 'PATCH'
        const payload = modo === 'crear'
            ? { nombre, area: depAreaId.value }
            : { nombre }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error')

            modal.hide()
            modalEl.addEventListener('hidden.bs.modal', () => location.reload(), { once: true })
        } catch (err) {
            showToast(err.message, 'danger')
        }
    })

    /* ===============================
       ELIMINAR
    =============================== */
    window.eliminarDependencia = async id => {
        if (!confirm('¿Eliminar dependencia?')) return

        const item = document.querySelector(`[data-id="${id}"]`)?.closest('li')

        const res = await fetch(`/api/dependencias/${id}`, { method: 'DELETE' })
        if (!res.ok) return showToast('Error al eliminar', 'danger')

        if (item) {
            item.style.transition = 'all .25s ease'
            item.style.opacity = '0'
            item.style.transform = 'translateX(20px)'
            setTimeout(() => item.remove(), 250)
        }

        showToast('Dependencia eliminada')
    }

    /* ===============================
       BUSCADOR ÁREA / DEPENDENCIA
    =============================== */
    buscador.addEventListener('input', e => {
        const texto = e.target.value.toLowerCase().trim()

        document.querySelectorAll('.area-row').forEach(row => {
            const area = row.dataset.area
            const deps = row.querySelectorAll('.dep-item')

            let matchArea = area.includes(texto)
            let matchDep = false

            deps.forEach(dep => {
                const depName = dep.dataset.dep
                const visible = depName.includes(texto)

                dep.style.display = visible || !texto ? '' : 'none'
                if (visible) matchDep = true
            })

            row.style.display = matchArea || matchDep || !texto ? '' : 'none'
        })
    })

    /* Limpieza backdrop (bug Bootstrap) */
    modalEl.addEventListener('hidden.bs.modal', () => {
        document.body.classList.remove('modal-open')
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove())
    })
})()

/* ===============================
   TOASTS
=============================== */
const showToast = (msg, type = 'success') => {
    const container = document.getElementById('toastContainer')

    const toastEl = document.createElement('div')
    toastEl.className = `toast align-items-center text-bg-${type} border-0`
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${msg}</div>
            <button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `

    container.appendChild(toastEl)
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 })
    toast.show()

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
}
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('modalDependencia');
    if (!modalEl) return;
  
    window.modal = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false
    });
  });
  