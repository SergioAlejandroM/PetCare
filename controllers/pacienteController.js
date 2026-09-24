const Paciente = require('../models/Paciente');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');


const crearPaciente = asyncHandler(async(req,res) =>{
    const paciente = await Paciente.create(req.body);
    res.status(201).json({ok: true,data: paciente});
});


const listarPacientes = asyncHandler(async(req,res) =>{
    const pacientes = await Paciente.find({activo:true});
    res.json({ok:true, data: pacientes});
});

const obtenerPaciente = asyncHandler(async(req,res)=>{
    const paciente = await Paciente.findById(req.params.id);
    if(!paciente) throw new ApiError(404, 'Paciente no encontrado');
    res.json({ok: true, data: paciente});
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



module.exports = {crearPaciente, listarPacientes, obtenerPaciente, actualizarPaciente, desactivarPaciente};