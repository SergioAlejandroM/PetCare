const express = require('express');
const cors = require('cors');
const {errorHandler} = require('../middleware/errorHandler');
const clienteRoutes = require('../routes/clienteRoutes');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/clientes', clienteRoutes);

app.use((req, res) => res.status(404).json({ ok: false, error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;