
const Movimiento = require('../models/Movimiento');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const mostrarDashboard = async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    res.render('historial', { movimientos });
  } catch (error) {
    console.error('Error al cargar historial de movimiento:', error);
    res.status(500).send('Error al cargar historial de movimiento');
  }
};

const getTopAreas = async (req, res) => {
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
    const topAreas = await Movimiento.aggregate([
      { $match: { tipo: 'salida', fecha: { $gte: fechaInicio } } },
      {
        $group: {
          _id: '$area',
          total: { $sum: '$cantidad' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    res.json(topAreas);
  } catch (err) {
    console.error('Error al obtener top de áreas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


exports.mostrarDashboard = async (req, res) => {
  try {
    const entradas = await Movimiento.find({ tipo: 'entrada' })
      .populate('producto')
      .populate('usuario');

    const salidas = await Movimiento.find({ tipo: 'salida' })
      .populate('producto')
      .populate('usuario');

    res.render('historial', { entradas, salidas });
  } catch (err) {
    res.status(500).send('Error historial de movimientos');
  }
};


module.exports = {
  mostrarDashboard,
  getTopAreas,
};
