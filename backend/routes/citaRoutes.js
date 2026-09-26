const express = require('express');
const router = express.Router();
const { agendarCita, listarCitas, actualizarEstadoCita} = require('../controllers/citaController');

router.post('/', agendarCita);
router.get('/', listarCitas);
router.patch('/:id/estado', actualizarEstadoCita);

module.exports = router;