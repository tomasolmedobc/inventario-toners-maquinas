const Producto = require('../models/Producto');
const Movimiento = require('../models/Movimiento');
const User = require('../models/User');

// Función auxiliar para actualizar stock
function actualizarStock(prod, tipo, cantidad) {
  if (tipo === 'entrada') {
    prod.cantidad += cantidad;
  } else if (tipo === 'salida') {
    if (prod.cantidad < cantidad) throw new Error('Stock insuficiente');
    prod.cantidad -= cantidad;
  } else {
    throw new Error('Tipo de movimiento inválido');
  }
}

// Crear un nuevo producto (Carga inicial)
const crearProducto = async (req, res) => {
  try {
    const { tipo, marca, modelo, compatibilidad, cantidad } = req.body;

    if (!tipo || !marca || !modelo || isNaN(cantidad)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const compatibilidadFinal = Array.isArray(compatibilidad)
      ? compatibilidad
      : typeof compatibilidad === 'string'
        ? compatibilidad.split(',').map(c => c.trim())
        : [];

    const producto = new Producto({
      tipo,
      marca,
      modelo,
      compatibilidad: compatibilidadFinal,
      cantidad: parseInt(cantidad)
    });

    await producto.save();
    res.status(201).json(producto);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Registrar movimiento (entrada o salida)
const registrarMovimiento = async (req, res) => {
  try {
    const { producto, tipo, cantidad, area, observacion } = req.body;

    const cantidadNum = parseInt(cantidad);
    if (!producto || !tipo || isNaN(cantidadNum) || cantidadNum <= 0) {
      return res.status(400).json({ error: 'Datos del movimiento inválidos' });
    }

    if (tipo === 'salida' && !area) {
      return res.status(400).json({ error: 'Área requerida para una salida' });
    }

    const prod = await Producto.findById(producto);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    try {
      actualizarStock(prod, tipo, cantidadNum);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    await prod.save();

    const movimiento = new Movimiento({
      producto,
      tipo,
      cantidad: cantidadNum,
      area: area || '',
      observacion: observacion || '',
      usuario: req.session.usuario?._id || null // o req.usuario._id si usás JWT
    });

    await movimiento.save();
    res.status(201).json(movimiento);
  } catch (err) {
    console.error('Error al registrar movimiento:', err);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
};

// Ver entregas (solo salidas)
const verEntregas = async (req, res) => {
  try {
    const entregas = await Movimiento.find({ tipo: 'salida' })
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    res.render('entregas', { entregas });
  } catch (err) {
    console.error('Error al obtener entregas:', err);
    res.status(500).send('Error interno del servidor');
  }
};
const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos); 
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const mostrarDashboard = async (req, res) => {
  try {
    const entradas = await Movimiento.find({ tipo: 'entrada' })
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    const salidas = await Movimiento.find({ tipo: 'salida' })
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    res.render('dashboard', { entradas, salidas });
  } catch (error) {
    console.error('Error al mostrar dashboard:', error);
    res.status(500).send('Error al cargar dashboard');
  }
};

module.exports = {
  crearProducto,
  registrarMovimiento,
  verEntregas,
  listarProductos,
  mostrarDashboard
};
