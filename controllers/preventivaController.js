const Preventiva = require('../models/Preventiva');
const Area = require('../models/Area');

const normalizarTexto = (valor) => (valor || '').toString().trim();
const ESTADOS_VALIDOS = ['pendiente', 'recibido', 'facturado'];

exports.mostrarPreventivas = async (req, res) => {
  try {
    const preventivas = await Preventiva.find()
      .populate('area', 'nombre')
      .sort({ fecha: -1 })
      .lean();

    res.render('preventivas', { preventivas });
  } catch (error) {
    console.error('Error mostrarPreventivas:', error);
    res.status(500).send('Error al cargar preventivas');
  }
};

exports.listarPreventivas = async (req, res) => {
  try {
    const preventivas = await Preventiva.find()
      .populate('area', 'nombre')
      .sort({ fecha: -1 });

    res.json(preventivas);
  } catch (error) {
    console.error('Error listarPreventivas:', error);
    res.status(500).json({ error: 'Error al obtener preventivas' });
  }
};

exports.crearPreventiva = async (req, res) => {
  try {
    const numeroPreventiva = normalizarTexto(req.body.numeroPreventiva);
    const detalles = normalizarTexto(req.body.detalles);
    const fecha = req.body.fecha;
    const area = normalizarTexto(req.body.area);
    const estado = normalizarTexto(req.body.estado) || 'pendiente';

    if (!numeroPreventiva || !detalles || !fecha || isNaN(Date.parse(fecha)) || !area) {
      return res.status(400).json({ error: 'N° de preventiva, detalles, fecha y área son obligatorios' });
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const areaExiste = await Area.findById(area);
    if (!areaExiste) {
      return res.status(400).json({ error: 'Área inválida' });
    }

    const preventiva = await Preventiva.create({
      numeroPreventiva,
      detalles,
      fecha,
      area,
      estado
    });

    const preventivaPopulada = await preventiva.populate('area', 'nombre');

    res.status(201).json({ ok: true, preventiva: preventivaPopulada });
  } catch (error) {
    console.error('Error crearPreventiva:', error);
    res.status(500).json({ error: 'Error al crear la preventiva' });
  }
};

exports.actualizarPreventiva = async (req, res) => {
  try {
    const preventiva = await Preventiva.findById(req.params.id);
    if (!preventiva) {
      return res.status(404).json({ error: 'Preventiva no encontrada' });
    }

    if (req.body.numeroPreventiva !== undefined) {
      preventiva.numeroPreventiva = normalizarTexto(req.body.numeroPreventiva);
    }
    if (req.body.detalles !== undefined) {
      preventiva.detalles = normalizarTexto(req.body.detalles);
    }

    if (req.body.fecha !== undefined) {
      if (isNaN(Date.parse(req.body.fecha))) {
        return res.status(400).json({ error: 'Fecha inválida' });
      }
      preventiva.fecha = req.body.fecha;
    }

    if (req.body.area !== undefined) {
      const area = normalizarTexto(req.body.area);
      const areaExiste = await Area.findById(area);
      if (!areaExiste) {
        return res.status(400).json({ error: 'Área inválida' });
      }
      preventiva.area = area;
    }

    if (req.body.estado !== undefined) {
      const estado = normalizarTexto(req.body.estado);
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      preventiva.estado = estado;
    }

    if (!preventiva.numeroPreventiva) {
      return res.status(400).json({ error: 'El N° de preventiva es obligatorio' });
    }
    if (!preventiva.detalles) {
      return res.status(400).json({ error: 'Los detalles son obligatorios' });
    }

    await preventiva.save();
    const preventivaPopulada = await preventiva.populate('area', 'nombre');

    res.json({ ok: true, preventiva: preventivaPopulada });
  } catch (error) {
    console.error('Error actualizarPreventiva:', error);
    res.status(500).json({ error: 'Error al actualizar la preventiva' });
  }
};

exports.eliminarPreventiva = async (req, res) => {
  try {
    const preventiva = await Preventiva.findByIdAndDelete(req.params.id);
    if (!preventiva) {
      return res.status(404).json({ error: 'Preventiva no encontrada' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error eliminarPreventiva:', error);
    res.status(500).json({ error: 'Error al eliminar la preventiva' });
  }
};
