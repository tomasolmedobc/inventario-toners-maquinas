const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      trim: true
    },
    mesAnio: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const OrdenCompraSchema = new mongoose.Schema(
  {
    numeroOrden: {
      type: String,
      required: true,
      trim: true
    },
    empresa: {
      type: String,
      required: true,
      trim: true
    },
    fechaEmision: {
      type: Date,
      required: true
    },
    fechaFinalizacion: {
      type: Date,
      default: null
    },
    detalles: {
      type: String,
      trim: true,
      default: ''
    },
    cantidadFacturas: {
      type: Number,
      required: true,
      min: 1
    },
    facturas: {
      type: [FacturaSchema],
      default: []
    }
  },
  { timestamps: true }
);

OrdenCompraSchema.index({ fechaEmision: -1 });

module.exports = mongoose.model('OrdenCompra', OrdenCompraSchema);
