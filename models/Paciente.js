const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true},
    especie: { type: String, required: true, trim: true},
    raza: { type: String, trim: true},
    dueño: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    activo: { type: Boolean, default: true}
}, {timestamps: true});

module.exports = mongoose.model('Paciente', pacienteSchema);