const express = require('express');
const router = express.Router();

const {crearPaciente, listarPacientes, obtenerDueñoDelPaciente, obtenerPaciente, historialPaciente, actualizarPaciente, desactivarPaciente} = require('../controllers/pacienteController');

router.post('/', crearPaciente);  // post: crear
router.get('/', listarPacientes);
router.get('/:id/dueño', obtenerDueñoDelPaciente)  // get: consultar todos
router.get('/:id', obtenerPaciente);
router.get('/:id/historial', historialPaciente)  //get: solo consulta uno
router.put('/:id', actualizarPaciente);  //put: actualizar
router.patch('/:id/desactivar', desactivarPaciente);  //patch: realizar un cambio 

module.exports = router;