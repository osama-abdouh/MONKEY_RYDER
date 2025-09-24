const express = require('express');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;
const contextPath = '/api';

app.use(cors({origin:"http://localhost:4200"}));
app.use(express.json()); // necessario per leggere il body JSON


//////////////////////////////
// ELIMINARE PIU AVANTI///////
// Importa il client Supabase
const supabase = require('./services/db');
// Esempio di endpoint che legge dati dalla tabella "test" usando Supabase
app.get('/test', async (req, res) => {
  // Le query con Supabase sono asincrone e restituiscono un oggetto con "data" e "error"
  const { data, error } = await supabase
    .from('utenti') // Nome della tabella
    .select('*'); // Seleziona tutte le colonne

  if (error) {
    // Se c'è un errore, lo mostriamo e restituiamo un messaggio
    console.error('Errore Supabase:', error.message);
    return res.json({ success: false, error: error.message });
  }
  // Se la query va a buon fine, restituiamo i dati
  res.json({ success: true, data });
});
//////////////////////////////
//////////////////////////////



// Endpoint per controllare lo stato del server
app.get('/health', (req, res) => {
  // Restituisce un oggetto JSON che indica che il server è attivo
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});