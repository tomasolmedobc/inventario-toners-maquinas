const mongoose = require('mongoose');

const auditoriaSchema = new mongoose.Schema({
  accion: {
    type: String,
    required: true
  },

  modulo: {
    type: String,
    enum: [
      'EQUIPOS',
      'INVENTARIO',
      'MOVIMIENTOS',
      'USUARIOS'
    ],
    required: true
  },

  referencia: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenciaModelo'
  },

  referenciaModelo: {
    type: String
  },

  descripcion: {
    type: String
  },

  usuario: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nombre: String,
    email: String
  },

  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Auditoria', auditoriaSchema);
