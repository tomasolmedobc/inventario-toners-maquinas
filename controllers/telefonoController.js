const Telefono = require('../models/Telefono');

const normalizarTexto = (valor) => (valor || '').toString().trim();

exports.listarTelefonos = async (req, res) => {
  try {
    const telefonos = await Telefono.find().sort({ estado: 1, numeroTelefonico: 1 });
    res.json(telefonos);
  } catch (error) {
    console.error('Error listarTelefonos:', error);
    res.status(500).json({ error: 'Error al obtener telefonos' });
  }
};

exports.crearTelefono = async (req, res) => {
  try {
    const numeroTelefonico = normalizarTexto(req.body.numeroTelefonico);
    const empresa = normalizarTexto(req.body.empresa);
    const dependencia = normalizarTexto(req.body.dependencia);
    const personaCargo = normalizarTexto(req.body.personaCargo);

    if (!numeroTelefonico || !empresa || !dependencia || !personaCargo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const telefono = await Telefono.create({
      numeroTelefonico,
      empresa,
      dependencia,
      personaCargo
    });

    res.status(201).json({ ok: true, telefono });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El numero telefonico ya existe' });
    }

    console.error('Error crearTelefono:', error);
    res.status(500).json({ error: 'Error al crear telefono' });
  }
};

exports.actualizarTelefono = async (req, res) => {
  try {
    const telefono = await Telefono.findById(req.params.id);
    if (!telefono) {
      return res.status(404).json({ error: 'Telefono no encontrado' });
    }

    const campos = ['numeroTelefonico', 'empresa', 'dependencia', 'personaCargo', 'estado'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        telefono[campo] = normalizarTexto(req.body[campo]);
      }
    });

    if (!['ACTIVO', 'BAJA'].includes(telefono.estado)) {
      return res.status(400).json({ error: 'Estado invalido' });
    }

    telefono.fechaBaja = telefono.estado === 'BAJA' ? (telefono.fechaBaja || new Date()) : undefined;

    await telefono.save();
    res.json({ ok: true, telefono });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'El numero telefonico ya existe' });
    }

    console.error('Error actualizarTelefono:', error);
    res.status(500).json({ error: 'Error al actualizar telefono' });
  }
};

exports.darDeBajaTelefono = async (req, res) => {
  try {
    const telefono = await Telefono.findByIdAndUpdate(
      req.params.id,
      { estado: 'BAJA', fechaBaja: new Date() },
      { new: true }
    );

    if (!telefono) {
      return res.status(404).json({ error: 'Telefono no encontrado' });
    }

    res.json({ ok: true, telefono });
  } catch (error) {
    console.error('Error darDeBajaTelefono:', error);
    res.status(500).json({ error: 'Error al dar de baja telefono' });
  }
};
