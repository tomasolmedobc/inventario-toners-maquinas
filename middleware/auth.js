const jwt = require('jsonwebtoken');

// 🔐 Verificar sesión
const verificarSesion = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

// 🧠 Roles para VISTAS
const permitirRolesVista = (...roles) => {
  return (req, res, next) => {
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.redirect('/auth/login');
    }

    if (!roles.includes(usuario.rol)) {
      return res.status(403).render('403');
    }

    next();
  };
};

// 🧠 Roles para API
const permitirRolesApi = (...roles) => {
  return (req, res, next) => {
    const usuario = req.session.usuario;

    if (!usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(usuario.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    next();
  };
};

module.exports = {
  verificarSesion,
  permitirRolesVista,
  permitirRolesApi
};
