const express = require('express');
const app = express();


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

app.get('/hello', (req, res) => {
  res.send('Hola Mundo!');
});

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000');
});