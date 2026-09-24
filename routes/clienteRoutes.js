const express = require('express');
const router = express.Router();

const { crearCliente } = require('../controllers/clienteController');

router.post('/', crearCliente);

module.exports = router;