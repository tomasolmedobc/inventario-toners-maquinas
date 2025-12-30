const mongoose = require('mongoose');

const TraspasoEquipoSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },

  areaAnterior: String,
  dependenciaAnterior: String,
  usernamePcAnterior: String,
  nombreApellidoAnterior: String,


  areaNueva: String,
  dependenciaNueva: String,
  usernamePcNueva:String,
  nombreApellidoNuevo: String,

  usuario: {
    type: String // o ObjectId User si querés
  },

  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TraspasoEquipo', TraspasoEquipoSchema);
