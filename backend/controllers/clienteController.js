const Cliente = require('../models/Cliente');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');

// POST

const crearCliente = asyncHandler(async (req, res) => {
    const cliente = await Cliente.create(req.body);
    req.status(201).json({ ok: true, data: cliente});
});

const listarClientes = asyncHandler(async(req, res) =>{
    const clientes = await Cliente.find({activo: true});
    res.json({ok: true, data: clientes})
});

const obtenerCliente = asyncHandler(async(req, res) => {
    const cliente = await Cliente.findById(req.params.id);
    if(!cliente) throw new ApiError(404,'Cliente no encontrado');
    res.json({ok: true, data: cliente});
});

const actualizarCliente = asyncHandler(async(req, res) => {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!cliente) throw new ApiError(404,'Cliente no encontrado');
    res.json({ok: true, data: cliente});
});

const desactivarCliente = asyncHandler(async(req, res) => {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, 
        { activo : false },
        { new: true}
    );
    if(!cliente) throw new ApiError(404,'Cliente no encontrado');
    res.json({ok: true, data: cliente});
});

module.exports = { crearCliente, listarClientes, obtenerCliente, actualizarCliente, desactivarCliente};