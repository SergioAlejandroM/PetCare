const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const {errorHandler} = require('../middleware/errorHandler');
const clienteRoutes = require('../routes/clienteRoutes');
const pacienteRoutes = require('../routes/pacienteRoutes');
const citaRoutes = require('../routes/citaRoutes');
const consultaRoutes = require('../routes/consultaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    const dbOk = mongoose.connection.readyState === 1;
    res.status(dbOk ? 200 : 503).json({ ok: dbOk });
});

app.use('/api/clientes', clienteRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/consultas', consultaRoutes);

const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use((req, res) => res.status(404).json({ ok: false, error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;