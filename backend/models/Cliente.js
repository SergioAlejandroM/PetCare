const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true},
    telefono: {type: String, required: true, trim: true},
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    direccion: { type: String, trim: true},
    activo: { type: Boolean, default: true}
}, {timestamps: true});

module.exports = mongoose.model('Cliente', clienteSchema);