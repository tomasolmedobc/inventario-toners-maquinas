export const API = {
    async getFiltros() {
        const res = await fetch('/api/equipos/filtros');
        return await res.json();
    },

    async getEquipos(estado) {
        const res = await fetch(`/api/equipos?estado=${estado}`);
        return await res.json();
    },

    async getTraspasos() {
        const res = await fetch('/api/equipos-traspasos');
        return await res.json();
    },

    async getService(codigo) {
        const res = await fetch(`/api/service-equipo/${codigo}`);
        return await res.json();
    },

    /**
     * Devuelve los datos de un equipo por su ID
     */
    async getDetalle(id) {
        const res = await fetch(`/api/equipos?detalle=${id}`);
        if (!res.ok) throw new Error('No se pudo obtener el detalle');
        return await res.json();
    },

    async crearEquipo(data) {
        return await fetch('/api/equipos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    /**
     * Actualiza los datos de un equipo (Editar)
     */
    async actualizarEquipo(id, data) {
        return await fetch(`/api/equipos/${id}`, { // ID en la URL, sin el "?"
            method: 'PATCH',                      
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    async darBaja(id) {
        return await fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' });
    },

    async realizarTraspaso(id, payload) {
        return await fetch(`/api/equipos/${id}/traspaso`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
};