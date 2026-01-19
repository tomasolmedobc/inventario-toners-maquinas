const jwt = require('jsonwebtoken');

// Middleware para verificar sesión
const verificarSesion = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect('/auth/login');
  }
};

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
};


const isAdmin = (req, res, next) => {
  if (req.session.usuario?.rol === 'admin') {
    return next();
  }
  res.redirect('/');
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rol = req.session.usuario?.rol;

    if (rolesPermitidos.includes(rol)) {
      return next();
    }

    return res.status(403).render('403'); // o redirect('/')
  };
};

module.exports = {
  verificarSesion,
  verificarToken,
  permitirRoles,
  isAdmin
};


