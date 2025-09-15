// Importa le dipendenze
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Crea un'applicazione Express
const app = express();

// Configura la porta
const PORT = process.env.PORT || 3000;

// Middleware per il parsing del JSON
app.use(express.json());
app.use(cors()); // serve perchè il frontend è nella porta 4200 backend 3000

// Rotte di esempio
app.get('/', (req, res) => {
  res.send('Benvenuto nel backend di MonkeyDriver!');
});

const healthRoutes = require('./routes/health');
app.use('/api', healthRoutes);

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});