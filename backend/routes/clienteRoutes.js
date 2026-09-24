const express = require('express');
const router = express.Router();

const { crearCliente, listarClientes, obtenerCliente, actualizarCliente, desactivarCliente} = require('../controllers/clienteController');

router.post('/', crearCliente);
router.get('/', listarClientes);
router.get('/:id', obtenerCliente);
router.put('/:id', actualizarCliente);
router.patch('/:id/desactivar', desactivarCliente);

module.exports = router;