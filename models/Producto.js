const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  compatibilidad: [String],
  cantidad: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('Producto', productoSchema);
