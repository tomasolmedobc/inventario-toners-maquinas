const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema(
  {
    fechaPago: {
      type: Date,
      default: Date.now
    },
    vencimientoCubierto: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const VencimientoSchema = new mongoose.Schema(
  {
    empresa: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    ultimoVencimiento: {
      type: Date,
      default: null
    },
    proximoVencimiento: {
      type: Date,
      required: true
    },
    pagado: {
      type: Boolean,
      default: false
    },
    historialPagos: {
      type: [PagoSchema],
      default: []
    }
  },
  { timestamps: true }
);

VencimientoSchema.index({ proximoVencimiento: 1 });

module.exports = mongoose.model('Vencimiento', VencimientoSchema);
