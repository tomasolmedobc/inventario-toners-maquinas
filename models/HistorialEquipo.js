const mongoose = require('mongoose');

const HistorialEquipoSchema = new mongoose.Schema({
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
        enum: ['ALTA', 'REPARACION', 'TRASPASO', 'OBSERVACION', 'BAJA'],
        required: true
    },

    detalle: {
        type: String,
        required: true
    },

    usuario: String,
}, { timestamps: true });

module.exports = mongoose.model('HistorialEquipo', HistorialEquipoSchema);

