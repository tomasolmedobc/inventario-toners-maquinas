// controllers/indexController.js
const Movimiento = require('../models/Movimiento');

const mostrarInicio = async (req, res) => {
  try {
    const movimientos = await Movimiento.find({ tipo: 'salida' }).populate('producto');

    const tonerMovs = movimientos.filter(mov =>
      mov.producto && mov.producto.tipo.toLowerCase() === 'toner'
    );

    const datosPorMesYArea = {};
    const totalesPorArea = {};

    tonerMovs.forEach(mov => {
      const fecha = new Date(mov.fecha);
      const mes = fecha.getMonth(); // 0 - 11
      const area = mov.area;

      if (!datosPorMesYArea[area]) {
        datosPorMesYArea[area] = Array(12).fill(0);
        totalesPorArea[area] = 0;
      }

      datosPorMesYArea[area][mes] += mov.cantidad;
      totalesPorArea[area] += mov.cantidad;
    });

    const topAreas = Object.entries(totalesPorArea)
      .map(([area, total]) => ({ area, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.render('index', {
      graficoData: datosPorMesYArea,
      topAreas,
    });
  } catch (error) {
    console.error('Error generando gráfico de tóneres:', error);
    res.render('index', {
      graficoData: {},
      topAreas: [],
    });
  }
};

module.exports = { mostrarInicio };
