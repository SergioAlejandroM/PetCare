const express = require('express');
const router = express.Router();

const {crearPaciente, listarPacientes, obtenerPaciente, actualizarPaciente, desactivarPaciente} = require('../controllers/pacienteController');

router.post('/', crearPaciente);  // post: crear
router.get('/', listarPacientes);  // get: consultar todos
router.get('/:id', obtenerPaciente);  //get: solo consulta uno
router.put('/:id', actualizarPaciente);  //put: actualizar
router.patch('/:id/desactivar', desactivarPaciente);  //patch: realizar un cambio 

module.exports = router;