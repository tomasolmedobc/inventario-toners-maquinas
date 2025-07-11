const Movimiento = require('../models/Movimiento');

const verNotaEntrega = async (req, res) => {
  const { id } = req.params;

  try {
    const movimientoOriginal = await Movimiento.findById(id).populate('producto usuario');
    if (!movimientoOriginal) return res.status(404).send('Movimiento no encontrado');

    // Buscar todos los movimientos relacionados (ej. parte de una salida múltiple)
    const movimientos = await Movimiento.find({
      tipo: 'salida',
      area: movimientoOriginal.area,
      observacion: movimientoOriginal.observacion,
      usuario: movimientoOriginal.usuario._id,
      fecha: {
        $gte: new Date(movimientoOriginal.fecha.getTime() - 3000), // margen de tiempo
        $lte: new Date(movimientoOriginal.fecha.getTime() + 3000)
      }
    }).populate('producto usuario');

    // 👇 Mandamos ambos: uno como cabecera y el resto como lista
    res.render('nota-entrega', {
      movimiento: movimientoOriginal,
      movimientos
    });
  } catch (err) {
    console.error('❌ Error al generar nota:', err);
    res.status(500).send('Error interno al generar nota de entrega');
  }
};

module.exports = { verNotaEntrega };
