const express = require('express');
const router = express.Router();

const { guardarConsulta } = require('../controllers/consultaController');

router.post('/', guardarConsulta);

module.exports = router;