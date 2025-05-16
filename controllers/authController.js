const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.mostrarLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.mostrarRegistro = (req, res) => {
  res.render('register', { error: null });
};

exports.registrarUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;
  try {
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) return res.render('register', { error: 'Ya existe un usuario con ese email' });

    const nuevoUsuario = new User({ nombre, email, contraseña });
    await nuevoUsuario.save();
    res.redirect('/login');
  } catch (error) {
    res.render('register', { error: 'Error al registrar usuario' });
  }
};

exports.loginUsuario = async (req, res) => {
  const { email, contraseña } = req.body;
  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return res.render('login', { error: 'Usuario no encontrado' });

    const coincide = await usuario.validarContraseña(contraseña);
    if (!coincide) return res.render('login', { error: 'Contraseña incorrecta' });

    // Guardamos el usuario en la sesión
    req.session.usuario = {
      _id: usuario._id,  // 👈 este es el nombre que después usás
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    res.redirect('/');
  } catch (error) {
    res.render('login', { error: 'Error al iniciar sesión' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
