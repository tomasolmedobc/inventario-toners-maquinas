const mongoose = require('mongoose');
const Area = require('../models/Area');
const Dependencia = require('../models/Dependencia');
const Equipo = require('../models/Equipo');
const TraspasoEquipo = require('../models/TraspasoEquipo');
const Auditoria = require('../models/Auditoria');
const registrarAuditoria = require('../utils/registrarAuditoria');

/* ==========================
  VISTA
========================== */
exports.verEquipos = async (req, res) => {
  try {
    const areas = await Area.find().sort({ nombre: 1 });
    const dependencias = await Dependencia.find().sort({ nombre: 1 });

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
      const equipo = await Equipo.findById(req.query.detalle)
        .populate('area', 'nombre')
        .populate('dependencia', 'nombre');

      return res.json(equipo);
    }

    let { estado, area, dependencia, search } = req.query;
    const filtro = {};

    if (estado) {
      filtro.estado = estado.toUpperCase();
    }
    

    if (area) filtro.area = area;
    if (dependencia) filtro.dependencia = dependencia;

    if (search?.trim()) {
      filtro.usernamePc = { $regex: search, $options: 'i' };
    }

    const equipos = await Equipo.find(filtro)
      .populate('area', 'nombre')
      .populate('dependencia', 'nombre')
      .sort({ createdAt: -1 });

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
      usernamePc,
      codigoIdentificacion,
      procesador,
      ram,
      disco,
      ip,
      hostname,
      nombreApellido
    } = req.body;

    if (!area || !dependencia || !usernamePc || !codigoIdentificacion) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }

    const equipo = await Equipo.create({
      area,
      dependencia,
      usernamePc,
      codigoIdentificacion,
      procesador,
      ram,
      disco,
      ip,
      hostname,
      nombreApellido
    });

    await registrarAuditoria({
      accion: 'ALTA_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Alta de equipo ${equipo.usernamePc}`,
      usuario: req.session.usuario
    });

    res.json({ ok: true });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'El código de identificación ya existe'
      });
    }

    console.error('❌ Error crearEquipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
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

    const camposPermitidos = [
      'procesador', 'ram', 'disco', 'ip', 'hostname', 'usernamePc', 'nombreApellido'
    ];
    camposPermitidos.forEach(c => {
      if (req.body[c] !== undefined) equipo[c] = req.body[c];
    });

    await equipo.save();

    await registrarAuditoria({
      accion: 'EDICION_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Edición de equipo ${equipo.usernamePc}`,
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
    const { area, dependencia, usernamePc, nombreApellido } = req.body

    if (
      !mongoose.Types.ObjectId.isValid(area) ||
      !mongoose.Types.ObjectId.isValid(dependencia)
    ) {
      return res.status(400).json({ error: 'Área o dependencia inválida' })
    }

    const equipo = await Equipo.findById(req.params.id)
    if (!equipo) return res.status(404).json({ error: 'No encontrado' })
    if (equipo.estado !== 'ACTIVO') {
      return res.status(403).json({ error: 'Equipo dado de baja' })
    }

    const mismoArea = equipo.area?.toString() === area
    const mismaDep = equipo.dependencia?.toString() === dependencia

    if (
      mismoArea &&
      mismaDep &&
      equipo.usernamePc === usernamePc &&
      equipo.nombreApellido === nombreApellido
    ) {
      return res.status(400).json({ error: 'No hay cambios para registrar' })
    }

    await TraspasoEquipo.create({
      equipo: equipo._id,
      areaAnterior: equipo.area,
      dependenciaAnterior: equipo.dependencia,
      usernamePcAnterior: equipo.usernamePc,
      nombreApellidoAnterior: equipo.nombreApellido,
      areaNueva: area,
      dependenciaNueva: dependencia,
      usernamePcNueva: usernamePc,
      nombreApellidoNuevo: nombreApellido,
      usuario: req.session.usuario.nombre
    })

    equipo.area = area
    equipo.dependencia = dependencia
    equipo.usernamePc = usernamePc
    equipo.nombreApellido = nombreApellido
    await equipo.save()

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error traspasando equipo' })
  }
}

exports.listarTraspasos = async (req, res) => {
  try {
    const traspasos = await TraspasoEquipo.find()
    .populate('areaAnterior', 'nombre')
    .populate('dependenciaAnterior', 'nombre')
    .populate('areaNueva', 'nombre')
    .populate('dependenciaNueva', 'nombre')
    .populate('equipo', 'codigoIdentificacion usernamePc')
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
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    await registrarAuditoria({
      accion: 'BAJA_EQUIPO',
      modulo: 'EQUIPOS',
      referencia: equipo._id,
      referenciaModelo: 'Equipo',
      descripcion: `Baja de equipo ${equipo.usernamePc}`,
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

exports.obtenerFiltros = async (req, res) => {
  try {
    const areas = await Area.find().sort({ nombre: 1 });
    const dependencias = await Dependencia.find().sort({ nombre: 1 });

    res.json({ areas, dependencias });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener filtros' });
  }
};
