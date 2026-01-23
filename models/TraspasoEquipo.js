const mongoose = require('mongoose');

const TraspasoEquipoSchema = new mongoose.Schema({
  equipo: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipo', required: true },

  areaAnterior: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
  dependenciaAnterior: { type: mongoose.Schema.Types.ObjectId, ref: 'Dependencia' },

  areaNueva: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
  dependenciaNueva: { type: mongoose.Schema.Types.ObjectId, ref: 'Dependencia' },

  usernamePcAnterior: String,
  usernamePcNueva: String,

  nombreApellidoAnterior: String,
  nombreApellidoNuevo: String,

  usuario: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TraspasoEquipo', TraspasoEquipoSchema);
