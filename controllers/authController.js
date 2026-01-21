const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.mostrarLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.mostrarRegistro = (req, res) => {
  res.render('register', { error: null });
};

exports.registrarUsuario = async (req, res) => {
  const { nombre, email, userName, contraseña } = req.body;

  try {
    const existe = await User.findOne({
      $or: [{ email }, { userName }]
    });

    if (existe)
      return res.render('register', { error: 'Email o usuario ya existente' });

    const nuevoUsuario = new User({
      nombre,
      email: email.toLowerCase(),
      userName: userName.toLowerCase(),
      contraseña
    });
    

    await nuevoUsuario.save();
    res.redirect('/auth/login');
  } catch (error) {
    res.render('register', { error: 'Error al registrar usuario' });
  }
};

exports.loginUsuario = async (req, res) => {
  const { userName, contraseña } = req.body;
  const identificador = userName.toLowerCase();

  try {
    const usuario = await User.findOne({
      $or: [{ userName: identificador }, { email: identificador }]
    });

    if (!usuario)
      return res.render('login', { error: 'Usuario no encontrado' });

    const coincide = await usuario.validarContraseña(contraseña);
    if (!coincide)
      return res.render('login', { error: 'Contraseña incorrecta' });

    req.session.usuario = {
      _id: usuario._id,
      nombre: usuario.nombre,
      rol: usuario.rol
    };

    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Error al iniciar sesión' });
  }
};



exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
