const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true
  },
  dependencia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dependencia',
    required: true
  },

  usernamePc: { type: String, required: true },
  procesador: String,
  ram: String,
  disco: String,
  ip: String,
  hostname: String,
  nombreApellido: String,

  codigoIdentificacion: {
    type: String,
    required: true,
    unique: true
  },

  estado: {
    type: String,
    enum: ['ACTIVO', 'BAJA'],
    default: 'ACTIVO'
  },

  observacionBaja: String,
  fechaBaja: Date
}, { timestamps: true });

module.exports = mongoose.model('Equipo', EquipoSchema);
