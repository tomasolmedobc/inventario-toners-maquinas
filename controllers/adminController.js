const User = require('../models/User');
const bcrypt = require('bcryptjs');
// Obtener lista de usuarios (solo para administradores)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, 'nombre email userName rol');

    res.render('usuarios', { usuarios });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
};

const cambiarPasswordManual = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaPassword, confirmarPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (nuevaPassword !== confirmarPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    const hash = await bcrypt.hash(nuevaPassword, 10);

    const user = await User.findByIdAndUpdate(id, { contraseña: hash }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña manual:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


const cambiarRolManual = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['admin', 'jefe', 'user'].includes(rol)) {

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
  listarUsuarios,
  cambiarPasswordManual,
  cambiarRolManual
};
