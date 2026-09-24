const Cliente = require('../models/Cliente');
const {asyncHandler, ApiError} = require('../middleware/errorHandler');

// POST

const crearCliente = asyncHandler( async (req, res) => {
    const cliente = await Cliente.create(req.body);
    req.status(201).json({ ok: true, data: cliente});
});

module.exports = { crearCliente };