const Telefono = require('../models/Telefono');

const mostrarInicio = async (req, res) => {
  try {
    const telefonos = await Telefono.find()
      .sort({ estado: 1, numeroTelefonico: 1 })
      .lean();

    res.render('index', { telefonos });
  } catch (error) {
    console.error('Error index:', error);
    res.render('index', { telefonos: [] });
  }
};

module.exports = { mostrarInicio };
