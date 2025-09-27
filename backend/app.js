const express = require('express');
const cors = require('cors');
const testRouter = require('./routes/test');
const userRouter = require('./routes/user');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');

const app = express();
const port = process.env.PORT || 3000;

const contextPath = '/api';

app.use(cors({origin:"http://localhost:4200"}));
app.use(express.json()); // necessario per leggere il body JSON

app.use(contextPath, testRouter);
app.use(contextPath, userRouter);
app.use(contextPath, registerRouter);
app.use(contextPath, loginRouter);

// Endpoint per controllare lo stato del server per il frontend
app.get('/health', (req, res) => {
  // Restituisce un oggetto JSON che indica che il server è attivo
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});