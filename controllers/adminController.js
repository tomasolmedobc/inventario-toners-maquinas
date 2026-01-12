const User = require('../models/User');

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



module.exports = {
  listarUsuarios,

};
