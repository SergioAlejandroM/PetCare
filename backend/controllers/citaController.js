const cita = require('../models/Cita');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');
const Cita = require('../models/Cita');

const agendarCita = asyncHandler(async(req, res) => {
    const cita = await Cita.create(req.body);
    req.status(201).json({ ok: true, data: cita});
});

const listarCitas = asyncHandler(async(req, res) => {
    const citas = await Cita.find().populate('paciente');
    res.json({ok: true, data: citas})
});

const actualizarEstadoCita = asyncHandler(async(req, res) => {
    const {estado} = req.body;
    if(!['Pendiente','Atendida','Cancelada'].includes(estado)){
        throw new ApiError(400, 'Estado invalido');
    }

    const cita = await Cita.findByIdAndUpdate(req.params.id,{estado},{ new: true});
    if(!cita) throw new ApiError(404,'Cita no encontrada');

    res.json({ok: true, data: cita})
});

module.exports = { agendarCita, listarCitas, actualizarEstadoCita};