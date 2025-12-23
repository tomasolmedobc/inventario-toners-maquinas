const mongoose = require('mongoose');

const traspasoSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  areaAnterior: String,
  areaNueva: String,
  dependenciaAnterior: String,
  dependenciaNueva: String,
  codigoAnterior: String,
  codigoNuevo: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Traspaso', traspasoSchema);
