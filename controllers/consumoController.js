const ExcelJS = require('exceljs');
const Movimiento = require('../models/Movimiento');

/* ===============================
  FUNCIÓN COMÚN (filtros + aggregate)
================================ */
const obtenerConsumo = async ({ desde, hasta }) => {
  const match = {
    tipo: 'salida',
    anulado: false
  };

  // 👉 filtrar solo si hay fechas
  if (desde || hasta) {
    match.fecha = {};
    if (desde) match.fecha.$gte = new Date(desde);
    if (hasta) match.fecha.$lte = new Date(hasta);
  }

  return Movimiento.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'productos',
        localField: 'producto',
        foreignField: '_id',
        as: 'producto'
      }
    },
    { $unwind: '$producto' },
    { $match: { 'producto.tipo': { $regex: /^toner$/i } } },
    {
      $group: {
        _id: {
          periodo: {
            $dateToString: { format: '%Y/%m', date: '$fecha' }
          },
          marca: '$producto.marca',
          modelo: '$producto.modelo'
        },
        total: { $sum: '$cantidad' }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

/* ===============================
   VISTA CON FILTRO
================================ */
const consumoPorMes = async (req, res) => {
  try {
    const consumo = await obtenerConsumo(req.query);
    const totalPeriodo = consumo.reduce((acc, t) => acc + t.total, 0);

    res.render('dashboard/consumo', {
      consumo,
      totalPeriodo,
      desde: req.query.desde || '',
      hasta: req.query.hasta || ''
    });
  } catch (error) {
    console.error(error);
    res.render('dashboard/consumo', {
      consumo: [],
      totalPeriodo: 0,
      desde: '',
      hasta: ''
    });
  }
};

/* ===============================
  EXPORTAR A EXCEL
================================ */
const exportarExcel = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const data = await obtenerConsumo(req.query);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Consumo de Toners');

    /* =========================
        TITULO PRINCIPAL
    ========================= */
    sheet.mergeCells('A1:C1');
    sheet.getCell('A1').value = 'INFORME DE CONSUMO DE TÓNERS';
    sheet.getCell('A1').font = { size: 16, bold: true };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    /* =========================
        DESCRIPCIÓN
    ========================= */
    sheet.mergeCells('A2:C2');
    sheet.getCell('A2').value =
      'Este informe muestra la cantidad total de tóners utilizados, agrupados por marca y modelo.';
    sheet.getCell('A2').font = { italic: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    /* =========================
        PERÍODO
    ========================= */
    sheet.mergeCells('A3:C3');
    sheet.getCell('A3').value = `Período analizado: ${desde || 'Inicio'} hasta ${hasta || 'Hoy'}`;
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    sheet.getCell('A5').value = 'Período';
    sheet.getCell('B5').value = 'Marca';
    sheet.getCell('C5').value = 'Modelo';
    sheet.getCell('D5').value = 'Cantidad Consumida';
    sheet.getCell('A5', 'B5', 'C5', 'D5').alignment = { horizontal: 'center' };



    /* =========================
        ENCABEZADOS
    ========================= */
    sheet.columns = [
      { header: 'Período', key: 'periodo', width: 15 },
      { header: 'Marca', key: 'marca', width: 25 },
      { header: 'Modelo', key: 'modelo', width: 30 },
      { header: 'Cantidad consumida', key: 'total', width: 20 }
    ];


    const headerRow = sheet.getRow(5);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    /* =========================
        DATOS
    ========================= */
    data.forEach(item => {
      sheet.addRow({
        periodo: item._id.periodo,
        marca: item._id.marca,
        modelo: item._id.modelo,
        total: item.total
      });
    });


    /* =========================
        TOTAL GENERAL
    ========================= */
    const totalPeriodo = data.reduce((acc, i) => acc + i.total, 0);

    const totalRow = sheet.addRow({
      marca: 'TOTAL GENERAL',
      modelo: '',
      total: totalPeriodo
    });

    totalRow.font = { bold: true };

    /* =========================
        BORDES
    ========================= */
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5) {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    /* =========================
        DESCARGA
    ========================= */
    const nombreArchivo = `consumo_toners_${desde || 'inicio'}_${hasta || 'hoy'}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${nombreArchivo}`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al exportar Excel');
  }
};


module.exports = {
  consumoPorMes,
  exportarExcel
};
