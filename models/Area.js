const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Area', AreaSchema);
