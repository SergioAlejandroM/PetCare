const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
    cita: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cita',
        required: true,
        unique: true
    },
    diagnostico: { type: String, required: true, trim: true},
    tratamiento: { type: String, required: true, trim: true},
    patologiaDetectada: { type: String, trim: true}
}, {timestamps: true});

module.exports = mongoose.model('Consulta', consultaSchema);