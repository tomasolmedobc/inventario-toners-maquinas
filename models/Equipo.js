const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: true,
      trim: true
    },
    
    dependencia:{
        type: String,
        required:true,
        trim: true
    
    },

    usernamePc: {
      type: String, // Ej: PC-ADMIN-01
      required: true,
      trim: true
    },

    procesador: {
      type: String,
      default: ''
    },

    ram: {
      type: String, // Ej: 16 GB
      default: ''
    },

    disco: {
      type: String, // Ej: SSD 480 GB
      default: ''
    },

    ip: {
      type: String,
      default: ''
    },

    hostname: {
      type: String,
      default: ''
    },

    nombreApellido: {
      type: String, // Usuario asignado al equipo
      default: ''
    },

    codigoIdentificacion: {
      type: String,
      unique: true,
      required: true
    },

    estado: {
      type: String,
      enum: ['ACTIVO', 'BAJA'],
      default: 'ACTIVO'
    },

    observacionBaja: {
      type: String,
      default: ''
    },

    fechaBaja: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Equipo', EquipoSchema);
