
const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  tipo: {
    type: String,
    enum: ['entrada', 'salida'],
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: function () {
      return this.tipo === 'salida'
    }
  },
  observacion: {
    type: String,
    default: ''
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  anulado: {
    type: Boolean,
    default: false
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
