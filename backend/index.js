// Backend Express.js per Monkey Rider - Sistema di autenticazione
// Progetto per esame "Ingegneria dei Sistemi Web" - Università di Ferrara

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Configurazione connessione PostgreSQL
// Usa variabili d'ambiente per sicurezza e portabilità
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Test connessione database all'avvio
pool.connect()
  .then(() => console.log('🐘 PostgreSQL connesso con successo'))
  .catch(err => console.error('❌ Errore connessione database:', err));

// Crea applicazione Express
const app = express();

// MIDDLEWARE GLOBALI (ordine importante!)
// 1. CORS - Permette richieste dal frontend Angular (porta 4200)
app.use(cors({
  origin: 'http://localhost:4200', // Solo dal frontend Angular
  credentials: true
}));

// 2. Parser JSON - Converte il body delle richieste in oggetti JavaScript
app.use(express.json());

// ROTTE API PER L'AUTENTICAZIONE

// Rotta di test per verificare che il server funzioni
app.get('/api/hello', (req, res) => { 
  res.json({ 
    message: 'Hello from Express with PostgreSQL!',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL connesso'
  });
});

// REGISTRAZIONE UTENTE
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validazione input lato server (sempre necessaria per sicurezza)
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password sono obbligatori' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password deve essere di almeno 6 caratteri' });
    }
    
    // Hash della password con bcrypt (fattore di costo 10 = sicuro per 2024)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserimento nel database con query parametrizzata (previene SQL injection)
    const result = await pool.query(
      'INSERT INTO UTENTE (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id_utente, username, email',
      [username, email || `${username}@temp.com`, hashedPassword] // Adattato alla struttura tabella UTENTE
    );
    
    console.log('✅ Nuovo utente registrato:', result.rows[0]);
    
    res.status(201).json({ 
      message: 'Registrazione avvenuta con successo', 
      user: result.rows[0] 
    });
    
  } catch (err) {
    // Gestione errori specifici PostgreSQL
    if (err.code === '23505') { // Violazione vincolo unicità
      return res.status(400).json({ error: 'Email già esistente' });
    }
    
    console.error('❌ Errore durante registrazione:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// LOGIN UTENTE
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Cambiato da username a email
    
    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }
    
    // Cerca utente nel database per email
    const result = await pool.query(
      'SELECT id_utente, username, email, password_hash FROM UTENTE WHERE email = $1', 
      [email]
    );
    
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Verifica password con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Genera token JWT per sessione utente
    const token = jwt.sign(
      { 
        sub: user.id_utente,           // Subject (ID utente)
        email: user.email,      // Email utente
        name: user.username    // Nome utente
      }, 
      process.env.JWT_SECRET,   // Chiave segreta dal file .env
      { expiresIn: '24h' }      // Token valido per 24 ore
    );
    
    console.log('✅ Login effettuato per:', user.email);
    
    res.json({ 
      message: 'Login effettuato con successo', 
      token,
      user: {
        id: user.id_utente,
        email: user.email,
        name: user.username
      }
    });
    
  } catch (err) {
    console.error('❌ Errore durante login:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// ROTTE STATICHE
app.get('/', (req, res) => {
  res.send(`
    <h1>🐒 Monkey Rider Backend</h1>
    <p>Server Express.js per e-commerce componenti auto</p>
    <p>Università di Ferrara - Ingegneria dei Sistemi Web</p>
    <ul>
      <li><a href="/api/hello">Test API</a></li>
      <li>POST /api/register - Registrazione utente</li>
      <li>POST /api/login - Login utente</li>
    </ul>
  `);
});

// Import rotte aggiuntive (health check, etc.)
const healthRoutes = require('./routes/health');
app.use('/api', healthRoutes);

// GESTIONE ERRORI GLOBALE
app.use((err, req, res, next) => {
  console.error('❌ Errore non gestito:', err);
  res.status(500).json({ error: 'Errore interno del server' });
});

// AVVIO SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server Monkey Rider avviato su http://localhost:${PORT}`);
  console.log(`📊 Database: PostgreSQL su localhost:5432`);
  console.log(`🎓 Progetto universitario - Ingegneria dei Sistemi Web`);
});