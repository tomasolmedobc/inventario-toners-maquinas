const mongoose = require('mongoose')

const ServiceEquipoSchema = new mongoose.Schema({
  equipo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  codigoIdentificacion: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['ENTRADA', 'SALIDA'],
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  usuario: String,
  fecha: {
    type: Date,
    default: Date.now   // 🔥 ESTA LÍNEA ES CLAVE
  }
})
module.exports = mongoose.model('ServiceEquipo', ServiceEquipoSchema)
