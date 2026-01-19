const Movimiento = require('../models/Movimiento');
const Area = require('../models/Area');
const mongoose = require('mongoose');

const verNotaEntrega = async (req, res) => {
  const { id } = req.params;

  try {
    const movimientoOriginal = await Movimiento.findById(id)
      .populate('producto usuario')
      .lean();

    if (!movimientoOriginal) {
      return res.status(404).send('Movimiento no encontrado');
    }

    /* ===============================
      RESOLVER ÁREA (solo visual)
    ================================ */
    let areaNombre = 'Sin área';

    if (typeof movimientoOriginal.area === 'string') {
      areaNombre = movimientoOriginal.area;
    } else if (mongoose.Types.ObjectId.isValid(movimientoOriginal.area)) {
      const area = await Area.findById(movimientoOriginal.area).lean();
      if (area) areaNombre = area.nombre;
    }

    /* ===============================
      BUSCAR MOVIMIENTOS RELACIONADOS
    ================================ */
    const movimientos = await Movimiento.find({
      tipo: 'salida',
      usuario: movimientoOriginal.usuario._id,
      observacion: movimientoOriginal.observacion,
      fecha: {
        $gte: new Date(movimientoOriginal.fecha.getTime() - 3000),
        $lte: new Date(movimientoOriginal.fecha.getTime() + 3000)
      }
    })
      .populate('producto usuario')
      .lean();

    res.render('nota-entrega', {
      movimiento: movimientoOriginal,
      movimientos,
      areaNombre
    });

  } catch (error) {
    console.error('❌ Error nota entrega:', error);
    res.status(500).send('Error interno al generar nota de entrega');
  }
};

module.exports = { verNotaEntrega };
