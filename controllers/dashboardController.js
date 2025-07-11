
  const Movimiento = require('../models/Movimiento');
  const User = require('../models/User');

   const mostrarDashboard = async (req, res) => {
    try {
       const movimientos = await Movimiento.find()
         .populate('producto')
         .populate('usuario')
         .sort({ fecha: -1 });
  
       res.render('dashboard', { movimientos });
     } catch (error) {
       console.error('Error al cargar dashboard:', error);
       res.status(500).send('Error al cargar dashboard');
     }
   };
  
  const getTopAreas = async (req, res) => {
  const { rango = '30' } = req.query;

  let fechaInicio;
  const hoy = new Date();
  if (rango === '30') {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 30));
  } else if (rango === '90') {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 90));
  } else if (rango === '1M') {
    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  } else {
    fechaInicio = new Date(hoy.setDate(hoy.getDate() - 30));
  }

  try {
    const topAreas = await Movimiento.aggregate([
      { $match: { tipo: 'salida', fecha: { $gte: fechaInicio } } },
      {
        $group: {
          _id: '$area',
          total: { $sum: '$cantidad' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    res.json(topAreas);
  } catch (err) {
    console.error('Error al obtener top de áreas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



const cambiarPasswordManual = async (req, res) => {
  const { id } = req.params;
  const { nuevaPassword, confirmarPassword } = req.body;

  if (!nuevaPassword || nuevaPassword.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (nuevaPassword !== confirmarPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);
  await User.findByIdAndUpdate(id, { password: hash });

  res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
};

const cambiarRolManual = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['admin', 'user'].includes(rol)) {

    return res.status(400).json({ error: 'Rol no válido' });
  }

  try {
    await User.findByIdAndUpdate(id, { rol });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};


module.exports = {
  mostrarDashboard,
  getTopAreas,
  cambiarPasswordManual,
  cambiarRolManual
};
