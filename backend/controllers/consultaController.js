const Consulta = require('../models/Consulta');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');

const Cita = require('../models/Cita');

const guardarConsulta = asyncHandler(async(req, res) => {
    const {cita} = req.body;

    const citaExiste =  await Cita.findById(cita);
    if(!citaExiste) throw new ApiError(400, 'La cita asociada no existe');

    const consulta = await Consulta.create(req.body);

    citaExiste.estado = 'Atendida';
    await citaExiste.save();

    res.status(201).json({ ok: true, data: consulta});
});

module.exports = { guardarConsulta };