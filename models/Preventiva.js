const mongoose = require('mongoose');

const PreventivaSchema = new mongoose.Schema(
  {
    numeroPreventiva: {
      type: String,
      required: true,
      trim: true
    },
    detalles: {
      type: String,
      required: true,
      trim: true
    },
    fecha: {
      type: Date,
      required: true
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true
    },
    estado: {
      type: String,
      enum: ['pendiente', 'recibido', 'facturado'],
      default: 'pendiente'
    }
  },
  { timestamps: true }
);

PreventivaSchema.index({ fecha: -1 });

module.exports = mongoose.model('Preventiva', PreventivaSchema);
