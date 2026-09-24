const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true
    },
    fechaHora: { type: Date, required: true},
    motivo: { type: String, required: true, trim: true},
    estado: {
        type: String,
        enum: ['Pendiente','Atendida','Cancelada'],
        default: 'Pendiente'
    }
}, {timestamps: true});

module.exports = mongoose.model('Cita', citaSchema);