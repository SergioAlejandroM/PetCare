const express = require('express');
const cors = require('cors');
const {errorHandler} = require('../middleware/errorHandler');
const clienteRoutes = require('../routes/clienteRoutes');
const pacienteRoutes = require('../routes/pacienteRoutes');
const citaRoutes = require('../routes/citaRoutes');
const consultaRoutes = require('../routes/consultaRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/clientes', clienteRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/consultas', consultaRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;