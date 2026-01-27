document.addEventListener('DOMContentLoaded', () => {
    let modalService = null

    /* ===============================
    ABRIR MODAL SERVICE
    ================================ */
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-service]')
        if (!btn) return

        document.getElementById('codigoEquipo').value = btn.dataset.service
        document.getElementById('equipoId').value = btn.dataset.id // 🔑
        document.getElementById('tipoService').value = ''
        document.getElementById('descripcionService').value = ''
        document.getElementById('motivoBaja').value = ''

        if (!modalService) {
            modalService = new bootstrap.Modal(
                document.getElementById('modalService')
            )
        }

        modalService.show()
    })

    /* ===============================
    REGISTRAR SERVICE
    ================================ */
    document.getElementById('formService')?.addEventListener('submit', async e => {
        e.preventDefault()

        const codigoIdentificacion = document.getElementById('codigoEquipo').value
        const tipo = document.getElementById('tipoService').value
        const descripcion = document.getElementById('descripcionService').value.trim()

        if (!tipo || !descripcion) {
            alert('Completá todos los campos')
            return
        }

        try {
            const res = await fetch('/api/service-equipo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigoIdentificacion, tipo, descripcion })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            modalService.hide()
            alert('Service registrado correctamente')
            location.reload()
        } catch (err) {
            alert(err.message)
        }
    })

    /* ===============================
        DAR DE BAJA EQUIPO
    ================================ */
    document.getElementById('btnBajaEquipo')?.addEventListener('click', async () => {
        const equipoId = document.getElementById('equipoId').value
        const motivo = document.getElementById('motivoBaja').value.trim()

        if (!motivo) {
            alert('Ingresá el motivo de la baja')
            return
        }

        if (!confirm('¿Seguro que querés dar de baja este equipo?')) return

        try {
            const res = await fetch('/api/baja', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ equipoId, motivo })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            alert('Equipo dado de baja correctamente')
            modalService.hide()
            location.reload()
        } catch (err) {
            alert(err.message)
        }
    })
})
