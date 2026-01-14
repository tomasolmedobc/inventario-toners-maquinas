const Movimiento = require('../models/Movimiento');

const consumoPorArea = async (req, res) => {
    try {
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

        res.render('dashboard/areas', { areas });

    } catch (err) {
        console.error(err);
        res.render('dashboard/areas', { areas: [] });
    }
};

module.exports = { consumoPorArea };
