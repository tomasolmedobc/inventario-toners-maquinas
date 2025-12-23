const Equipo = require('../models/Equipo');
const TraspasoEquipo = require('../models/TraspasoEquipo');
const Auditoria = require('../models/Auditoria');
const registrarAuditoria = require('../utils/registrarAuditoria');

/* ==========================
   VISTA
========================== */
exports.verEquipos = async (req, res) => {
  try {
    const areas = await Equipo.distinct('area');
    const dependencias = await Equipo.distinct('dependencia');

    res.render('equipos', { areas, dependencias });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar equipos');
  }
};

/* ==========================
   LISTAR / DETALLE
========================== */
exports.listarEquipos = async (req, res) => {
  try {
    if (req.query.detalle) {
      const equipo = await Equipo.findById(req.query.detalle);
      return res.json(equipo);
    }

    let { estado, area, dependencia, search } = req.query;
    const filtro = {};

    estado = (estado || '').toLowerCase();
    filtro.estado = estado === 'baja' ? 'BAJA' : 'ACTIVO';

    if (area) filtro.area = area;
    if (dependencia) filtro.dependencia = dependencia;

    if (search?.trim()) {
      filtro.maquina = { $regex: search, $options: 'i' };
    }

    const equipos = await Equipo.find(filtro).sort({ area: 1 });
    res.json(equipos);

  } catch (error) {
    console.error('❌ listarEquipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

/* ==========================
   CREAR
========================== */
exports.crearEquipo = async (req, res) => {
    try {
      const {
        area,
        dependencia,
        maquina,
        codigoIdentificacion,
        procesador,
        ram,
        disco,
        ip,
        hostname,
        usuario
      } = req.body;
  
      if (!area || !dependencia || !maquina || !codigoIdentificacion) {
        return res.status(400).json({
          error: 'Faltan campos obligatorios'
        });
      }
  
      const equipo = await Equipo.create({
        area,
        dependencia,
        maquina,
        codigoIdentificacion,
        procesador,
        ram,
        disco,
        ip,
        hostname,
        usuario
      });
  
      await registrarAuditoria({
        accion: 'ALTA_EQUIPO',
        modulo: 'EQUIPOS',
        referencia: equipo._id,
        referenciaModelo: 'Equipo',
        descripcion: `Alta de equipo ${equipo.maquina}`,
        usuario: req.session.usuario
      });
  
      res.json({ ok: true });
    } catch (error) {
      console.error('❌ Error crearEquipo:', error);
      res.status(400).json({
        error: error.message
      });
    }
  };
  
/* ==========================
   EDITAR (solo ACTIVO)
========================== */
exports.editarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);

    if (!equipo) return res.status(404).json({ error: 'No encontrado' });
    if (equipo.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Equipo dado de baja' });
    }

    Object.assign(equipo, req.body);
    await equipo.save();

    await registrarAuditoria({
      accion: 'EDICION_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Edición de equipo ${equipo.maquina}`,
      usuario: req.session.usuario
    });

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar equipo' });
  }
};

/* ==========================
   TRASPASO
========================== */
exports.traspasarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) return res.status(404).json({ error: 'No encontrado' });
    if (equipo.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Equipo dado de baja' });
    }

    const { area, dependencia, codigoIdentificacion } = req.body;

    await TraspasoEquipo.create({
      equipo: equipo._id,
      areaAnterior: equipo.area,
      dependenciaAnterior: equipo.dependencia,
      codigoAnterior: equipo.codigoIdentificacion,
      areaNueva: area,
      dependenciaNueva: dependencia,
      codigoNuevo: codigoIdentificacion,
      usuario: req.session.usuario.nombre
    });

    equipo.area = area;
    equipo.dependencia = dependencia;
    equipo.codigoIdentificacion = codigoIdentificacion;
    await equipo.save();

    await registrarAuditoria({
      accion: 'TRASPASO_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Traspaso a ${area}`,
      usuario: req.session.usuario
    });

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error traspasando equipo' });
  }
};
exports.listarTraspasos = async (req, res) => {
    try {
      const traspasos = await TraspasoEquipo.find()
        .populate('equipo', 'maquina')
        .sort({ fecha: -1 });
  
      res.json(traspasos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener traspasos' });
    }
  };
  

/* ==========================
   BAJA
========================== */
exports.darDeBaja = async (req, res) => {
  try {
    const equipo = await Equipo.findByIdAndUpdate(
      req.params.id,
      { estado: 'BAJA', fechaBaja: new Date() },
      { new: true }
    );

    await registrarAuditoria({
      accion: 'BAJA_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Baja de equipo ${equipo.maquina}`,
      usuario: req.session.usuario
    });

    res.json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al dar de baja' });
  }
};

/* ==========================
   HISTORIAL
========================== */
exports.historialEquipo = async (req, res) => {
  try {
    const historial = await Auditoria.find({
      modulo: 'EQUIPOS',
      referencia: req.params.id
    }).sort({ fecha: -1 });

    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};
