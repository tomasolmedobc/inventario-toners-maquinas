const ExcelJS = require('exceljs');
const Equipo = require('../models/Equipo');
const Traspaso = require('../models/TraspasoEquipo');

exports.exportarInventarioCompleto = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        
        // 1. Obtener datos con todas las relaciones necesarias
        const [activos, bajas, traspasos] = await Promise.all([
            Equipo.find({ estado: 'ACTIVO' }).populate('area dependencia'),
            Equipo.find({ estado: 'BAJA' }).populate('area dependencia'),
            // IMPORTANTE: populate('equipo') para sacar el código
            Traspaso.find().populate('areaAnterior areaNueva dependenciaAnterior dependenciaNueva equipo')
        ]);

        const aplicarEstiloHeader = (sheet) => {
            const row = sheet.getRow(1);
            row.font = { bold: true, color: { argb: 'FFFFFF' } };
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2E75B6' } };
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        };

        // --- Hoja 1: Activos & Hoja 2: Bajas (Misma estructura) ---
        [
            { name: 'Activos', data: activos },
            { name: 'Bajas', data: bajas }
        ].forEach(seccion => {
            const ws = workbook.addWorksheet(seccion.name);
            ws.columns = [
                { header: 'Área', key: 'area', width: 25 },
                { header: 'Dependencia', key: 'dep', width: 25 },
                { header: 'Responsable', key: 'nomApe', width: 25 },
                { header: 'Hostname', key: 'host', width: 20 },
                { header: 'Usuario PC', key: 'user', width: 20 },
                { header: 'Procesador', key: 'proc', width: 25 },
                { header: 'RAM', key: 'ram', width: 15 },
                { header: 'Disco', key: 'disk', width: 15 },
                { header: 'SO', key: 'so', width: 20 },
                { header: 'IP', key: 'ip', width: 20 },
                { header: 'Código', key: 'cod', width: 15 }
            ];

            seccion.data.forEach(e => ws.addRow({
                area: e.area?.nombre || '-',
                dep: e.dependencia?.nombre || '-',
                nomApe: e.nombreApellido || '-',
                host: e.hostname || '-',
                user: e.usernamePc || '-',
                proc: e.procesador || '-',
                ram: e.ram || '-',
                disk: e.disco || '-',
                so: e.sistemaOp || '-',
                ip: e.ip || '-',
                cod: e.codigoIdentificacion
            }));
            aplicarEstiloHeader(ws);
        });

        // --- Hoja 3: Traspasos ---
        const wsT = workbook.addWorksheet('Traspasos');
        wsT.columns = [
            { header: 'Fecha', key: 'f', width: 15 },
            { header: 'Código Equipo', key: 'cod', width: 15 }, // Agregado aquí para claridad
            { header: 'Area Origen', key: 'ao', width: 25 },
            { header: 'Area Destino', key: 'ad', width: 25 },
            { header: 'Dep. Origen', key: 'do', width: 25 },
            { header: 'Dep. Destino', key: 'dd', width: 25 },
            { header: 'User Ant.', key: 'ua', width: 15 },
            { header: 'User Nuevo', key: 'un', width: 15 },
            { header: 'Resp. Ant.', key: 'ra', width: 20 },
            { header: 'Resp. Nuevo', key: 'rn', width: 20 }
        ];

        traspasos.forEach(t => wsT.addRow({
            f: t.fecha ? new Date(t.fecha).toLocaleDateString() : '-',
            cod: t.equipo?.codigoIdentificacion || '-',
            ao: t.areaAnterior?.nombre || '-',
            ad: t.areaNueva?.nombre || '-',
            do: t.dependenciaAnterior?.nombre || '-',
            dd: t.dependenciaNueva?.nombre || '-',
            ua: t.usernamePcAnterior || '-',
            un: t.usernamePcNueva || '-',
            ra: t.nombreApellidoAnterior || '-',
            rn: t.nombreApellidoNuevo || '-'
        }));
        aplicarEstiloHeader(wsT);

        // 3. Respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Inventario.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error en Excel Controller:", error);
        res.status(500).json({ message: 'Error al generar el archivo Excel' });
    }
};