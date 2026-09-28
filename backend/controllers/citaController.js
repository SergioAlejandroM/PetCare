const {asyncHandler, ApiError} = require('../middleware/errorHandler');
const Cita = require('../models/Cita');

const agendarCita = asyncHandler(async(req, res) => {

    const citaExistente = await Cita.findOne({
        paciente: req.body.paciente,
        fechaHora: req.body.fechaHora,
        estado: { $ne: 'Cancelada' }
    });

    if (citaExistente) {
        throw new ApiError(
            400,
            'La mascota ya tiene una cita programada para esa fecha y hora'
        );
    }
    const fecha = new Date(req.body.fechaHora);

    if (fecha < new Date()) {
        throw new ApiError(
            400,
            'No se puede agendar una cita en una fecha pasada'
        );
    }
    
    const cita = await Cita.create(req.body);
    res.status(201).json({ ok: true, data: cita});
});

const listarCitas = asyncHandler(async(req, res) => {
    const citas = await Cita.find()
    .populate({
        path: 'paciente',
        populate: {
            path: 'dueño',
            select: 'nombre telefono email direccion'
        }
    });
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