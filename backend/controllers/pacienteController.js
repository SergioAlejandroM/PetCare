const Paciente = require('../models/Paciente');
const Cita = requiere('../models/Cita');
const Consulta = require('../models/Consulta');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');


const crearPaciente = asyncHandler(async(req,res) =>{
    const paciente = await Paciente.create(req.body);
    res.status(201).json({ok: true,data: paciente});
});


const listarPacientes = asyncHandler(async(req,res) =>{
    const pacientes = await Paciente.find({activo:true}).select('-dueño');
    res.json({ok:true, data: pacientes});
});

const obtenerDueñoDelPaciente = asyncHandler(async(req, res) => {
    const paciente = await Paciente.find({activo:true}).populate('dueño');
    if(!paciente) throw new ApiError(404, 'Paciente no encontrado');
    res.json({ok: true, data: paciente.dueño});
});

const obtenerPaciente = asyncHandler(async(req,res)=>{
    const paciente = await Paciente.findById(req.params.id).select('-dueño');
    if(!paciente) throw new ApiError(404, 'Paciente no encontrado');
    res.json({ok: true, data: paciente});
});

const historialPaciente = asyncHandler(async(req, res) =>{
    const citas = await Cita.find({paciente: req.params.id}).select('_id');
    const idsCitas = citas.map((c) => c._id);
    const historial = await Consulta.find({cita: { $in: idsCitas}}).populate('cita');
    res.json({ok: true, data: historial});
});

const actualizarPaciente = asyncHandler(async(req,res)=>{
    const paciente = await Paciente.findByIdAndUpdate(req.params.id, req.body,{
        new: true,// actualiza
        runValidators: true// se asegura de que los datos cumplan las reglas
    });
    if(!paciente) throw new ApiError(404,'Paciente no encontrado');
    res.json({ok: true, data: paciente});
});

const desactivarPaciente = asyncHandler(async(req, res)=>{
    const paciente = await Paciente.findByIdAndUpdate(req.params.id,
        {activo: false},
        {new: true}
    );
    if(!paciente) throw  new ApiError(404,'Paciente no encontrado');
    res.json({ok: true, data: paciente});
});



module.exports = {crearPaciente, listarPacientes, obtenerDueñoDelPaciente, obtenerPaciente, historialPaciente, actualizarPaciente, desactivarPaciente};