const Area = require('../models/Area');
const Movimiento = require('../models/Movimiento');

const listarAreas = async (req, res) => {
    const areas = await Area.find().sort({ nombre: 1 });
    res.render('dashboard/areas', { areas });
};


const crearArea = async (req, res) => {
    const nombre = req.body.nombre?.trim();
    if (!nombre) return res.redirect('/dashboard/areas');

    await Area.create({ nombre });
    res.redirect('/dashboard/areas');
};

/* ===============================
    EDITAR ÁREA
================================ */
const editarArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) return res.sendStatus(400);

        const area = await Area.findById(id);
        if (!area) return res.sendStatus(404);

        // actualizar movimientos
        await Movimiento.updateMany(
            { area: area._id },
            { $set: { area: area._id } }
        );

        area.nombre = nombre.trim();
        await area.save();

        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};

/* ===============================
    NORMALIZAR ÁREAS (fusionar)
================================ */
const normalizarArea = async (req, res) => {
    try {
        const { areaViejaId, areaNuevaId } = req.body;

        if (!areaViejaId || !areaNuevaId) {
            return res.status(400).json({ ok: false });
        }

        const result = await Movimiento.updateMany(
            { area: areaViejaId },
            { $set: { area: areaNuevaId } }
        );

        await Area.findByIdAndDelete(areaViejaId);

        res.json({
            ok: true,
            modificados: result.modifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false });
    }
};


module.exports = {
    listarAreas,
    crearArea,
    editarArea,
    normalizarArea
};
