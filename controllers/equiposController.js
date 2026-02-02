const mongoose = require('mongoose');
const Area = require('../models/Area');
const Dependencia = require('../models/Dependencia');
const Equipo = require('../models/Equipo');
const TraspasoEquipo = require('../models/TraspasoEquipo');
const Auditoria = require('../models/Auditoria');
const registrarAuditoria = require('../utils/registrarAuditoria');
const HistorialEquipo = require('../models/HistorialEquipo');

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
      sistemaOp,
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
      sistemaOp,
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
      'procesador', 'ram', 'disco', 'ip', 'hostname', 'usernamePc', 'nombreApellido', 'sistemaOp'
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
    const { area, dependencia, usernamePc, nombreApellido } = req.body;
    const equipoId = req.params.id;

    const equipo = await Equipo.findById(equipoId);
    if (!equipo) return res.status(404).json({ error: 'No encontrado' });

    // 1. Guardar TODOS los datos viejos
    const datosAnteriores = {
      area: equipo.area,
      dependencia: equipo.dependencia,
      usernamePc: equipo.usernamePc,
      nombreApellido: equipo.nombreApellido // <-- Te faltaba este para el registro
    };

    // 2. Actualizar equipo
    equipo.area = area;
    equipo.dependencia = dependencia;
    equipo.usernamePc = usernamePc;
    equipo.nombreApellido = nombreApellido;
    await equipo.save();

    // 3. Crear registro con los nombres EXACTOS del modelo
    await TraspasoEquipo.create({
      equipo: equipo._id,
      areaAnterior: datosAnteriores.area,
      dependenciaAnterior: datosAnteriores.dependencia,
      areaNueva: area,
      dependenciaNueva: dependencia,
      usernamePcAnterior: datosAnteriores.usernamePc,
      usernamePcNueva: usernamePc, // <-- Asegúrate de que termine en 'a' como en tu modelo
      nombreApellidoAnterior: datosAnteriores.nombreApellido, // <-- Agregado
      nombreApellidoNuevo: nombreApellido,
      usuario: req.session.usuario?.nombre || 'Sistema'
    });

    // 4. (Opcional) También puedes mantener el registro en HistorialEquipo si quieres
    await HistorialEquipo.create({
      equipo: equipo._id,
      tipo: 'TRASPASO',
      descripcion: `Traspaso a ${nombreApellido}`,
      usuario: req.session.usuario?.nombre || 'Sistema'
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error traspasando equipo' });
  }
};

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
exports.buscarHistorialPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const equipo = await Equipo.findOne({ codigoIdentificacion: codigo })
      .populate('area', 'nombre')
      .populate('dependencia', 'nombre');

    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const ultimoService = await HistorialEquipo.findOne({ equipo: equipo._id })
      .sort({ fecha: -1 });

    res.json({
      codigo: equipo.codigoIdentificacion,
      ultimoService: ultimoService?.descripcion || 'Sin service',
      fecha: ultimoService?.fecha || null,
      equipoId: equipo._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error buscando historial' });
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
