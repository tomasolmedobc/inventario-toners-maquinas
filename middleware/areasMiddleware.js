const Area = require('../models/Area');

module.exports = async (req, res, next) => {
  try {
    res.locals.areas = await Area.find().sort({ nombre: 1 });
    res.locals.usuario = req.session.usuario || null;
    next();
  } catch (err) {
    console.error('Error cargando áreas:', err);
    res.locals.areas = [];
    next();
  }
};
