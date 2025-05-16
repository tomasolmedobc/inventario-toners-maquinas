const Movimiento = require('../models/Movimiento');

const mostrarDashboard = async (req, res) => {
  try {
    const movimientos = await Movimiento.find()
      .populate('producto')
      .populate('usuario')
      .sort({ fecha: -1 });

    res.render('dashboard', { movimientos });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.status(500).send('Error al cargar dashboard');
  }
};

module.exports = {
  mostrarDashboard
};
