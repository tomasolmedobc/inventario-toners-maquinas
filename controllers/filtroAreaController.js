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
  
const editarArea = async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;
    
        const area = await Area.findById(id);
        if (!area || !nombre) return res.sendStatus(400);
    
    await Movimiento.updateMany(
            { area: area.nombre },
            { $set: { area: nombre.trim() } }
        );
    
        area.nombre = nombre.trim();
        await area.save();
    
        res.sendStatus(200);
    };

    const normalizarArea = async (req, res) => {
        try {
          const { areaVieja, areaNueva } = req.body;
      
          const nueva = areaNueva.trim();
      
          const result = await Movimiento.updateMany(
            { area: areaVieja },
            { $set: { area: nueva } }
          );
      
          res.json({
            ok: true,
            modificados: result.modifiedCount
          });
        } catch (error) {
          res.status(500).json({ ok: false, error: error.message });
        }
      };
      
module.exports = {
    listarAreas,
    crearArea,
    editarArea,
    normalizarArea
    };
