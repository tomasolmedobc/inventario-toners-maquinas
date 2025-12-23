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
const crearProducto = async (req, res) => {
  try {
    let { tipo, marca, modelo, compatibilidad, cantidad } = req.body;

    if (!tipo || !marca || !modelo || isNaN(cantidad)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    // Normalización
    tipo = tipo.trim().toLowerCase();
    tipo = tipo.charAt(0).toUpperCase() + tipo.slice(1);

    marca = marca.trim().toLowerCase();
    marca = marca.charAt(0).toUpperCase() + marca.slice(1);

    modelo = modelo.trim(); // No capitalizamos modelo, puede contener letras y números específicos

    const compatibilidadFinal = Array.isArray(compatibilidad)
      ? compatibilidad
      : typeof compatibilidad === 'string'
        ? compatibilidad.split(',').map(c => c.trim())
        : [];

    // Buscar si ya existe ese producto
    const productoExistente = await Producto.findOne({
      tipo: { $regex: new RegExp(`^${tipo}$`, 'i') },
      marca: { $regex: new RegExp(`^${marca}$`, 'i') },
      modelo: { $regex: new RegExp(`^${modelo}$`, 'i') }
    });

    if (productoExistente) {
      return res.status(400).json({ error: 'El producto ya existe con ese tipo, marca y modelo.' });
    }

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
const verEntregas = async (req, res) => {
  try {
    const entregas = await Movimiento.find({ tipo: 'salida' })
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    res.render('entregas', { entregas });
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    res.status(500).send('Error interno');
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
const getGraficoToners = async (req, res) => {
  const { rango = '30' } = req.query;

  let fechaInicio;
  const hoy = new Date();

  if (rango === '30') {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 30));
  } else if (rango === '90') {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 90));
  } else if (rango === '1M') {
    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  } else {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 30));
  }

  try {
    const movimientos = await Movimiento.aggregate([
      {
        $match: {
          tipo: 'salida',
          fecha: { $gte: fechaInicio }
        }
      },
      {
        $lookup: {
          from: 'productos',
          localField: 'producto',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: '$producto' },
      {
        $match: {
          'producto.tipo': { $regex: /^toner$/i }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: '$fecha' },
            año: { $year: '$fecha' },
            area: '$area'
          },
          total: { $sum: '$cantidad' }
        }
      },
      { $sort: { '_id.año': 1, '_id.mes': 1 } }
    ]);



    const mesesSet = new Set();
    const areasMap = {};

    movimientos.forEach(m => {
      const { mes, año, area } = m._id;
      const fechaKey = `${año}-${mes}`;
      mesesSet.add(fechaKey);

      if (!areasMap[area]) areasMap[area] = {};
      areasMap[area][fechaKey] = m.total;
    });

    const mesesOrdenados = Array.from(mesesSet).sort();
    const labels = mesesOrdenados.map(key => {
      const [y, m] = key.split('-');
      return new Date(y, m - 1).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
    });

    const datasets = Object.entries(areasMap).map(([area, dataByMes]) => {
      const data = mesesOrdenados.map(key => dataByMes[key] || 0);
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

      return {
        label: area || 'Sin área',
        data,
        backgroundColor: color
      };
    });

    res.json({ labels, datasets });
  } catch (err) {
    console.error('Error al obtener datos del gráfico por áreas:', err);
    res.status(500).json({ error: 'Error al generar gráfico por áreas' });
  }
};
  const editarMovimientoEntrega = async (req, res) => {
  const { id } = req.params;
  const { nuevaCantidad, observacion } = req.body;

  if (!observacion || isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const movimiento = await Movimiento.findById(id).populate('producto');

    if (!movimiento || movimiento.tipo !== 'salida') {
      return res.status(404).json({ error: 'Movimiento no válido' });
    }

    if (movimiento.anulado) {
      return res.status(400).json({ error: 'No se puede editar una entrega anulada' });
    }

    const producto = movimiento.producto;

    const diferencia = nuevaCantidad - movimiento.cantidad;

    // Si aumenta la entrega, verificar stock
    if (diferencia > 0 && producto.cantidad < diferencia) {
      return res.status(400).json({ error: 'Stock insuficiente' });
    }

    // Ajuste real de stock
    producto.cantidad -= diferencia;

    movimiento.cantidad = nuevaCantidad;
    movimiento.observacion += ` | EDITADO: ${observacion}`;

    await producto.save();
    await movimiento.save();

    res.json({ mensaje: 'Entrega editada correctamente' });
  } catch (error) {
    console.error('Error al editar entrega:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

const registrarMultiplesMovimientos = async (req, res) => {
  try {
    const { productos, tipo, area, observacion } = req.body;

    if (tipo !== 'salida' || !Array.isArray(productos) || productos.length === 0 || !area) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    for (const item of productos) {
      const prod = await Producto.findById(item.producto);
      if (!prod) continue;

      const cantidad = parseInt(item.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) continue;

      if (prod.cantidad < cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${prod.tipo} ${prod.marca} ${prod.modelo}` });
      }

      prod.cantidad -= cantidad;
      await prod.save();

      await Movimiento.create({
        producto: prod._id,
        tipo,
        cantidad,
        area,
        observacion: observacion || '',
        usuario: req.session.usuario?._id || null
      });
    }

    res.status(201).json({ mensaje: 'Movimientos registrados correctamente' });
  } catch (err) {
    console.error('Error al registrar múltiples movimientos:', err);
    res.status(500).json({ error: 'Error al registrar múltiples movimientos' });
  }
};
const anularMovimiento = async (req, res) => {
  try {
    const movimiento = await Movimiento.findById(req.params.id);
    if (!movimiento) return res.status(404).json({ error: 'Movimiento no encontrado' });

    if (movimiento.tipo !== 'salida') {
      return res.status(400).json({ error: 'Solo se pueden anular salidas' });
    }

    const producto = await Producto.findById(movimiento.producto);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    producto.cantidad += movimiento.cantidad;
    await producto.save();

    await movimiento.deleteOne();

    res.json({ mensaje: 'Entrega anulada y stock restituido correctamente' });
  } catch (err) {
    console.error('Error al anular entrega:', err);
    res.status(500).json({ error: 'Error interno al anular entrega' });
  }
};

const getTonersBajoStock = async (req, res) => {
  try {
    const umbral = 7; // configurable
    const toners = await Producto.find({
      tipo: /toner/i,
      cantidad: { $lt: umbral }
    });

    res.json(toners);
  } catch (error) {
    console.error("Error al obtener tóners con bajo stock:", error);
    res.status(500).json({ error: "Error al obtener los tóners con bajo stock" });
  }
};


module.exports = {
  crearProducto,
  registrarMovimiento,
  verEntregas,
  listarProductos,
  mostrarDashboard,
  getGraficoToners,
  editarMovimientoEntrega,
  registrarMultiplesMovimientos,
  anularMovimiento,
  getTonersBajoStock
};
