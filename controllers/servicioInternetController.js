const ServicioInternet = require('../models/ServicioInternet');
const Area = require('../models/Area');

const normalizarTexto = (valor) => (valor || '').toString().trim();

exports.mostrarServiciosInternet = async (req, res) => {
  try {
    const servicios = await ServicioInternet.find()
      .populate('area', 'nombre')
      .sort({ createdAt: -1 })
      .lean();

    res.render('servicios-internet', { servicios });
  } catch (error) {
    console.error('Error mostrarServiciosInternet:', error);
    res.status(500).send('Error al cargar servicios de internet');
  }
};

exports.listarServiciosInternet = async (req, res) => {
  try {
    const servicios = await ServicioInternet.find()
      .populate('area', 'nombre')
      .sort({ createdAt: -1 });

    res.json(servicios);
  } catch (error) {
    console.error('Error listarServiciosInternet:', error);
    res.status(500).json({ error: 'Error al obtener servicios de internet' });
  }
};

exports.crearServicioInternet = async (req, res) => {
  try {
    const proveedor = normalizarTexto(req.body.proveedor);
    const area = normalizarTexto(req.body.area);
    const direccion = normalizarTexto(req.body.direccion);
    const telefono = normalizarTexto(req.body.telefono);
    const personaCargo = normalizarTexto(req.body.personaCargo);

    if (!proveedor || !area || !direccion || !telefono || !personaCargo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const areaExiste = await Area.findById(area);
    if (!areaExiste) {
      return res.status(400).json({ error: 'Área inválida' });
    }

    const servicio = await ServicioInternet.create({
      proveedor,
      area,
      direccion,
      telefono,
      personaCargo
    });

    const servicioPopulado = await servicio.populate('area', 'nombre');

    res.status(201).json({ ok: true, servicio: servicioPopulado });
  } catch (error) {
    console.error('Error crearServicioInternet:', error);
    res.status(500).json({ error: 'Error al crear el servicio de internet' });
  }
};

exports.actualizarServicioInternet = async (req, res) => {
  try {
    const servicio = await ServicioInternet.findById(req.params.id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.body.area !== undefined) {
      const area = normalizarTexto(req.body.area);
      const areaExiste = await Area.findById(area);
      if (!areaExiste) {
        return res.status(400).json({ error: 'Área inválida' });
      }
      servicio.area = area;
    }

    const camposTexto = ['proveedor', 'direccion', 'telefono', 'personaCargo'];
    camposTexto.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        servicio[campo] = normalizarTexto(req.body[campo]);
      }
    });

    await servicio.save();
    const servicioPopulado = await servicio.populate('area', 'nombre');

    res.json({ ok: true, servicio: servicioPopulado });
  } catch (error) {
    console.error('Error actualizarServicioInternet:', error);
    res.status(500).json({ error: 'Error al actualizar el servicio de internet' });
  }
};

exports.eliminarServicioInternet = async (req, res) => {
  try {
    const servicio = await ServicioInternet.findByIdAndDelete(req.params.id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error eliminarServicioInternet:', error);
    res.status(500).json({ error: 'Error al eliminar el servicio de internet' });
  }
};
