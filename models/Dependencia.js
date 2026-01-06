const mongoose = require('mongoose');

const DependenciaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true }
});

DependenciaSchema.index({ nombre: 1, area: 1 }, { unique: true });

module.exports = mongoose.model('Dependencia', DependenciaSchema);
