const ExcelJS = require('exceljs');
const Equipo = require('../models/Equipo');
const Traspaso = require('../models/TraspasoEquipo');

exports.exportarInventarioCompleto = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // 1. Obtener datos directamente de la base de datos
        // Usamos .populate() para obtener los nombres de áreas y dependencias
        const [activos, bajas, traspasos] = await Promise.all([
            Equipo.find({ estado: 'ACTIVO' }).populate('area dependencia'),
            Equipo.find({ estado: 'BAJA' }).populate('area dependencia'),
            Traspaso.find().populate('areaAnterior areaNueva dependenciaAnterior dependenciaNueva')
        ]);

        const aplicarEstiloHeader = (sheet) => {
            const row = sheet.getRow(1);
            row.font = { bold: true, color: { argb: 'FFFFFF' } };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } };
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        };

        // --- Hoja 1: Activos ---
        const wsA = workbook.addWorksheet('Activos');
        wsA.columns = [
            { header: 'Área', key: 'area', width: 25 },
            { header: 'Dependencia', key: 'dep', width: 25 },
            { header: 'Usuario', key: 'user', width: 20 },
            { header: 'Hostname', key: 'host', width: 20 },
            { header: 'Código', key: 'cod', width: 15 }
        ];
        activos.forEach(e => wsA.addRow({ 
            area: e.area?.nombre || '-', 
            dep: e.dependencia?.nombre || '-', 
            user: e.usernamePc || '-', 
            host: e.hostname || '-', 
            cod: e.codigoIdentificacion 
        }));
        aplicarEstiloHeader(wsA);

        // --- Hoja 2: Bajas ---
        const wsB = workbook.addWorksheet('Bajas');
        wsB.columns = wsA.columns;
        bajas.forEach(e => wsB.addRow({ 
            area: e.area?.nombre || '-', 
            dep: e.dependencia?.nombre || '-', 
            user: e.usernamePc || '-', 
            host: e.hostname || '-', 
            cod: e.codigoIdentificacion 
        }));
        aplicarEstiloHeader(wsB);

        // --- Hoja 3: Traspasos ---
        const wsT = workbook.addWorksheet('Traspasos');
        wsT.columns = [
            { header: 'Fecha', key: 'f', width: 15 },
            { header: 'Origen', key: 'o', width: 30 },
            { header: 'Destino', key: 'd', width: 30 },
            { header: 'Usuario Ant.', key: 'ua', width: 20 }
        ];
        traspasos.forEach(t => wsT.addRow({ 
            f: t.fecha ? new Date(t.fecha).toLocaleDateString() : '-', 
            o: t.areaAnterior?.nombre || '-', 
            d: t.areaNueva?.nombre || '-', 
            ua: t.usernamePcAnterior || '-' 
        }));
        aplicarEstiloHeader(wsT);

        // 3. Configurar cabeceras de respuesta para descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Inventario.xlsx');

        // 4. Escribir directamente en el stream de respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error en Excel Controller:", error);
        res.status(500).json({ message: 'Error al generar el archivo Excel' });
    }
};