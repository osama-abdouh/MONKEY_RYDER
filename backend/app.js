const express = require('express');
const cors = require('cors');
const testRouter = require('./routes/test');
const userRouter = require('./routes/user');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const productRouter = require('./routes/products');


const app = express();
const port = process.env.PORT || 3000;

const contextPath = '/api'; // prefisso per tutte le rotte

app.use(cors({origin:"http://localhost:4200"}));
app.use(express.json()); // necessario per leggere il body JSON

//aggiungo le rotte al server
app.use(contextPath, testRouter);
app.use(contextPath, userRouter);
app.use(contextPath, registerRouter);
app.use(contextPath, loginRouter);
app.use(contextPath, productRouter);


// Endpoint per controllare lo stato del server per il frontend
app.get('/health', (req, res) => {
  // Restituisce un oggetto JSON che indica che il server è attivo
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});