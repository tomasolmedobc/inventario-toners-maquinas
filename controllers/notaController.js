const Movimiento = require('../models/Movimiento');

exports.verNotaEntrega = async (req, res) => {
  try {
    const movimiento = await Movimiento.findById(req.params.id)
      .populate('producto')
      .populate('usuario');

    if (!movimiento || movimiento.tipo !== 'salida') {
      return res.status(404).send('Movimiento no encontrado o no es una salida.');
    }

    res.render('nota-entrega', { movimiento });
  } catch (error) {
    console.error('Error al generar la nota de entrega:', error);
    res.status(500).send('Error interno del servidor');
  }
};
