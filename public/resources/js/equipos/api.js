export const API = {
  async getEquipos(estado) {
    return fetch(`/api/equipos?estado=${estado}`).then(r => r.json());
  },
  async getTraspasos() {
    return fetch('/api/equipos-traspasos').then(r => r.json());
  },
  async getDetalle(id) {
    return fetch(`/api/equipos?detalle=${id}`).then(r => r.json());
  },
  async getService(codigo) {
    return fetch(`/api/service-equipo/${codigo}`).then(r => r.json());
  },
  async darBaja(id) {
    return fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' });
  },
  async ejecutarTraspaso(id, payload) {
    return fetch(`/api/equipos/${id}/traspaso`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  async crearEquipo(data) {
    return fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
};