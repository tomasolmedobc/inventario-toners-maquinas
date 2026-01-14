const Movimiento = require('../models/Movimiento');

const mostrarInicio = async (req, res) => {
  try {
    const tonersMasConsumidos = await Movimiento.aggregate([
      {
        
          $match: {
            tipo: 'salida',
            anulado: false
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
              productoId: '$producto._id',
              marca: '$producto.marca',
              modelo: '$producto.modelo'
            },
            totalConsumido: { $sum: '$cantidad' }
          }
        },
        { $sort: { totalConsumido: -1 } },
        { $limit: 10 }
        
    ]);

    res.render('index', { tonersMasConsumidos });

  } catch (error) {
    console.error('Error index:', error);
    res.render('index', { tonersMasConsumidos: [] });
  }
  const tonersPorMes = await Movimiento.aggregate([
    {
      $match: {
        tipo: 'salida',
        anulado: false
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
          anio: { $year: '$fecha' },
          marca: '$producto.marca',
          modelo: '$producto.modelo'
        },
        total: { $sum: '$cantidad' }
      }
    },
    { $sort: { '_id.anio': -1, '_id.mes': -1, total: -1 } }
  ]);
  
  const areas = await Movimiento.aggregate([
    {
      $match: {
        tipo: 'salida',
        anulado: false,
        area: { $ne: '' }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$area' },
        total: { $sum: '$cantidad' }
      }
    },
    { $sort: { total: -1 } }
  ]);
  
  
};
  module.exports = { mostrarInicio };
  