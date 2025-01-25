const express = require('express');
const bodyParser = require('body-parser');
const penggunaController = require('./controllers/penggunaController');
const konsultasiKesehatanController = require('./controllers/konsultasiKesehatanController');
const rekamMedisController = require('./controllers/rekamMedisController');
const pembayaranController = require('./controllers/pembayaranController');
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use('/api', penggunaController);
app.use('/api', konsultasiKesehatanController);
app.use('/api', rekamMedisController);
app.use('/api', pembayaranController);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
