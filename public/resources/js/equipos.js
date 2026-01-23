(() => {
  let vistaActual = 'activos'
  let equiposCache = []

  /* ==========================
    DOM
  ========================== */
  const tbody = document.querySelector('#tablaEquipos tbody')
  const thead = document.querySelector('#tablaEquipos thead')

  const buscador = document.getElementById('buscador')
  const selectArea = document.getElementById('selectArea')
  const selectDependencia = document.getElementById('selectDependencia')

  const tabActivos = document.getElementById('tabActivos')
  const tabBajas = document.getElementById('tabBajas')
  const tabTraspasos = document.getElementById('tabTraspasos')

  const formNuevoEquipo = document.getElementById('formNuevoEquipo')

  const modalNuevoEquipo = new bootstrap.Modal(document.getElementById('modalNuevoEquipo'))
  const modalDetalle     = new bootstrap.Modal(document.getElementById('modalDetalleEquipo'))
  const modalEditar      = new bootstrap.Modal(document.getElementById('modalEditarEquipo'))
  const modalTraspaso    = new bootstrap.Modal(document.getElementById('modalTraspaso'))
  

  if (!tbody || !thead) return

  /* ==========================
    HELPERS
  ========================== */
  const areaNombre = e => e.area?.nombre || '-'
  const depNombre = e => e.dependencia?.nombre || '-'
  const areaId = e => e.area?._id
  const depId = e => e.dependencia?._id

  const toast = new bootstrap.Toast('#toastOk')
  const showToast = msg => {
    document.getElementById('toastMsg').textContent = msg
    toast.show()
  }

  /* ==========================
    HEADERS
  ========================== */
  const theadEquipos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Código</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
  `

  const theadTraspasos = `
    <tr>
      <th>Área</th>
      <th>Dependencia</th>
      <th>Usuario PC</th>
      <th>Responsable</th>
      <th>Fecha</th>
    </tr>
  `

  /* ==========================
    RENDER
  ========================== */
  function renderTabla(lista) {
    tbody.innerHTML = ''

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            No hay datos
          </td>
        </tr>`
      return
    }

    lista.forEach(e => {
      const acciones = e.estado === 'ACTIVO'
        ? `
          <div class="d-flex gap-1">
              <button
                  class="btn btn-sm btn-link text-primary action-btn"
                  data-edit="${e._id}"
                  title="Editar"
              >
                  <i class="fa-solid fa-pen-to-square"></i>
              </button>

              <button
                  class="btn btn-sm btn-link text-info action-btn"
                  data-traspaso="${e._id}"
                  title="Traspasar"
              >
                  <i class="fa-solid fa-right-left"></i>
              </button>

              <button
                  class="btn btn-sm btn-link text-warning action-btn"
                  data-baja="${e._id}"
                  title="Dar de baja"
              >
                  <i class="fa-solid fa-arrow-down-wide-short"></i>
              </button>
          </div>

        `
        : '<span class="text-muted">No editable</span>'

      tbody.insertAdjacentHTML('beforeend', `
        <tr class="${e.estado === 'BAJA' ? 'table-danger' : ''}">
          <td>${areaNombre(e)}</td>
          <td>${depNombre(e)}</td>
          <td>
            ${e.usernamePc}
            <button class="btn btn-sm btn-link text-secondary" data-detalle="${e._id}">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </td>
          <td>${e.codigoIdentificacion}</td>
          <td>
            <span class="badge ${e.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}">
              ${e.estado}
            </span>
          </td>
          <td>${acciones}</td>
        </tr>
      `)
    })
  }

  /* ==========================
    FILTROS
  ========================== */
  function refrescarFiltros() {
    const aSel = selectArea.value
    const dSel = selectDependencia.value

    const areas = new Map()
    const deps = new Map()

    equiposCache.forEach(e => {
      if (e.area) areas.set(e.area._id, e.area.nombre)
      if (e.dependencia) deps.set(e.dependencia._id, e.dependencia.nombre)
    })

    selectArea.innerHTML = '<option value="">Todas</option>'
    selectDependencia.innerHTML = '<option value="">Todas</option>'

    areas.forEach((n, id) =>
      selectArea.append(new Option(n, id, false, id === aSel))
    )
    deps.forEach((n, id) =>
      selectDependencia.append(new Option(n, id, false, id === dSel))
    )
  }

  function filtrar() {
    const t = buscador.value.toLowerCase()
    const a = selectArea.value
    const d = selectDependencia.value

    renderTabla(
      equiposCache.filter(e =>
        (!a || areaId(e) === a) &&
        (!d || depId(e) === d) &&
        (!t || [
          areaNombre(e),
          depNombre(e),
          e.usernamePc,
          e.codigoIdentificacion,
          e.hostname,
          e.nombreApellido
        ].some(v => v?.toLowerCase().includes(t)))
      )
    )
  }

  /* ==========================
    API
  ========================== */
  async function cargarEquipos() {
    if (vistaActual === 'traspasos') return

    const estado = vistaActual === 'activos' ? 'ACTIVO' : 'BAJA'
    const res = await fetch(`/api/equipos?estado=${estado}`)
    equiposCache = await res.json()

    refrescarFiltros()
    filtrar()
  }

  async function cargarTraspasos() {
    const res = await fetch('/api/equipos-traspasos')
    const lista = await res.json()

    tbody.innerHTML = lista.length
      ? lista.map(t => `
        <tr>
          <td>${t.areaAnterior?.nombre || '-'} → ${t.areaNueva?.nombre || '-'}</td>
          <td>${t.dependenciaAnterior?.nombre || '-'} → ${t.dependenciaNueva?.nombre || '-'}</td>
          <td>${t.usernamePcAnterior || '-'} → ${t.usernamePcNueva || '-'}</td>
          <td>${t.nombreApellidoAnterior || '-'} → ${t.nombreApellidoNuevo || '-'}</td>
          <td>${new Date(t.fecha).toLocaleString()}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="text-center text-muted">Sin traspasos</td></tr>`
  }

  /* ==========================
    EVENTOS
  ========================== */
  buscador.oninput = filtrar
  selectDependencia.onchange = filtrar

  tabActivos.onclick = () => cambiarVista('activos', theadEquipos, cargarEquipos)
  tabBajas.onclick = () => cambiarVista('bajas', theadEquipos, cargarEquipos)
  tabTraspasos.onclick = () => cambiarVista('traspasos', theadTraspasos, cargarTraspasos)

  function cambiarVista(vista, header, fn) {
    vistaActual = vista
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'))
    document.getElementById(`tab${vista.charAt(0).toUpperCase() + vista.slice(1)}`).classList.add('active')
    thead.innerHTML = header
    fn()
  }

  tbody.onclick = async e => {
    const btn = e.target.closest('button');
    if (!btn) return;
  
    if (btn.dataset.detalle) verDetalle(btn.dataset.detalle);
    if (btn.dataset.edit) abrirEditar(btn.dataset.edit);
    if (btn.dataset.traspaso) abrirTraspaso(btn.dataset.traspaso);
    if (btn.dataset.baja) darBaja(btn.dataset.baja);
  };
  
  selectArea.onchange = () => {
    const area = selectArea.value;
    const deps = new Map();
    selectDependencia.innerHTML = '<option value="">Todas</option>';
    equiposCache
    .filter(e => !area || e.area?._id === area)
    .forEach(e => {
      if (e.dependencia) {
        deps.set(e.dependencia._id, e.dependencia.nombre);
      }
    });
  
  deps.forEach((nombre, id) => {
    selectDependencia.append(new Option(nombre, id));
  });
  
    filtrar();
  };
  /* ==========================
    MODALES
  ========================== */
  async function verDetalle(id) {
    const e = await fetch(`/api/equipos?detalle=${id}`).then(r => r.json())
    document.getElementById('detalleEquipo').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><b>Área:</b> ${areaNombre(e)}</li>
        <li class="list-group-item"><b>Dependencia:</b> ${depNombre(e)}</li>
        <li class="list-group-item"><b>Usuario:</b> ${e.usernamePc}</li>
        <li class="list-group-item"><b>Nombre:</b> ${e.nombreApellido}</li>
        <li class="list-group-item"><b>IP:</b> ${e.ip}</li>
        <li class="list-group-item"><b>Código:</b> ${e.codigoIdentificacion}</li>
      </ul>`
    modalDetalle.show()
  }

  async function abrirEditar(id) {
    const e = await fetch(`/api/equipos?detalle=${id}`).then(r => r.json())
    Object.entries(e).forEach(([k, v]) => {
      const el = document.getElementById(`edit${k.charAt(0).toUpperCase() + k.slice(1)}`)
      if (el) el.value = v || ''
    })
    editId.value = id
    modalEditar.show()
  }

  async function abrirTraspaso(id) {
    const e = await fetch(`/api/equipos?detalle=${id}`).then(r => r.json())
    traspasoId.value = id
    traspasoArea.value = e.area?._id
    traspasoDependencia.value = e.dependencia?._id
    traspasoUsernamePc.value = e.usernamePc
    traspasoNombreApellido.value = e.nombreApellido
    modalTraspaso.show()
  }

  async function darBaja(id) {
    if (!confirm('¿Dar de baja este equipo?')) return
    await fetch(`/api/equipos/${id}/baja`, { method: 'PATCH' })
    showToast('Equipo dado de baja')
    cargarEquipos()
  }

  /* ==========================
    FORM NUEVO
  ========================== */
  formNuevoEquipo?.addEventListener('submit', async e => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(formNuevoEquipo))
    const res = await fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) return alert('Error al crear equipo')
    modalNuevoEquipo.hide()
    formNuevoEquipo.reset()
    showToast('Equipo creado')
    cargarEquipos()
  })
  window.confirmarTraspaso = async function () {
    try {
      const id = document.getElementById('traspasoId').value;
  
      const payload = {
        area: document.getElementById('traspasoArea').value,
        dependencia: document.getElementById('traspasoDependencia').value,
        usernamePc: document.getElementById('traspasoUsernamePc').value,
        nombreApellido: document.getElementById('traspasoNombreApellido').value
      };
  
      const res = await fetch(`/api/equipos/${id}/traspaso`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
  
      modalTraspaso.hide();
      showToast('Traspaso realizado');
      cargarEquipos();
  
    } catch (err) {
      showToast(err.message);
    }
  };
 
  /* ==========================
    INIT
  ========================== */
  thead.innerHTML = theadEquipos
  cargarEquipos()
})()
