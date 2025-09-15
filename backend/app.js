const express = require('express');
const app = express();

const { Client } = require('pg');

// Funzione per connettere al database con retry
async function connectToDatabase() {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    database: 'postgres',
    port: 5432,
    // Rimuoviamo la password per usare trust authentication
  });

  try {
    await client.connect();
    console.log('Connesso al database PostgreSQL');
    
    // Eseguiamo la query
    const res = await client.query('SELECT * FROM utenti;');
    console.log('Utenti trovati:', res.rows);
    
    return client;
  } catch (err) {
    console.error('Errore di connessione:', err.message);
    return null;
  }
}

// Chiamiamo la funzione dopo un breve ritardo
setTimeout(connectToDatabase, 2000);

app.get('/test', async (req, res) => {
  try {
    const result = await db.any('SELECT * FROM test');
    console.log('Database contenuto:', result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Errore:', error);
    res.json({ success: false, error: error.message });
  }
});

app.get('/hello', (req, res) => {
  res.send('Hola Mundo!');
});

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000');
});