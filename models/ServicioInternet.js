const mongoose = require('mongoose');

const ServicioInternetSchema = new mongoose.Schema(
  {
    proveedor: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true
    },
    direccion: {
      type: String,
      required: true,
      trim: true
    },
    telefono: {
      type: String,
      required: true,
      trim: true
    },
    personaCargo: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

ServicioInternetSchema.index({ area: 1 });

module.exports = mongoose.model('ServicioInternet', ServicioInternetSchema);
