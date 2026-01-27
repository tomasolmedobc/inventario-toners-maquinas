const mongoose = require('mongoose');

const HistorialEquipoSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },

  tipo: {
    type: String,
    enum: ['ALTA', 'TRASPASO', 'REPARACION', 'CAMBIO', 'BAJA'],
    required: true
  },

  descripcion: String,

  datosAnteriores: Object,
  datosNuevos: Object,

  usuario: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HistorialEquipo', HistorialEquipoSchema);
