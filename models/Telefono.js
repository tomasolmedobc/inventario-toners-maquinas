const mongoose = require('mongoose');

const TelefonoSchema = new mongoose.Schema(
  {
    numeroTelefonico: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    empresa: {
      type: String,
      required: true,
      trim: true
    },
    dependencia: {
      type: String,
      required: true,
      trim: true
    },
    personaCargo: {
      type: String,
      required: true,
      trim: true
    },
    estado: {
      type: String,
      enum: ['ACTIVO', 'BAJA'],
      default: 'ACTIVO'
    },
    fechaBaja: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Telefono', TelefonoSchema);
