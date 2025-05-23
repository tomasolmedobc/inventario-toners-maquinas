const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true }, //tipo de producto, toner, comp
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  cantidad: { type: Number, required: true, min: 1 },
  area: { type: String }, // solo obligatorio en salidas, se valida en el controlador
  observacion: { type: String },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movimiento', movimientoSchema);
