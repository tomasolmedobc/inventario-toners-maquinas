const User = require('../models/User');

// Obtener lista de usuarios (solo para administradores)
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, 'nombre email rol'); // No enviar contraseña
    res.render('admin/usuarios', { usuarios });
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
};




const verUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password'); // Sin mostrar el hash
    res.render('usuarios', { usuarios });
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    res.status(500).send('Error al obtener usuarios');
  }
};


module.exports = {
  listarUsuarios,
  verUsuarios,
};
