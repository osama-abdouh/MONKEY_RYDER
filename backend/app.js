const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productsRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const couponRouter = require('./routes/couponRoutes');
const fileUploadMiddleware = require('./middleware/fileUploadMiddleware');
const showcaseRoutes = require('./routes/showcaseRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const staticImagesMiddleware = express.static('assets/Immagini');


const app = express();
const port = process.env.PORT || 3000;

const contextPath = '/api'; // prefisso per tutte le rotte

app.use(cors({
  origin:"http://localhost:4200",
  allowedHeaders:["Content-Type","Authorization"]
}));
app.use(express.json()); // necessario per leggere il body JSON

//aggiungo le rotte al server
app.use(contextPath, authRouter);
app.use(contextPath, productRouter);
app.use(contextPath, wishlistRoutes);
app.use(contextPath, userRouter);

app.use('/assets/Immagini', staticImagesMiddleware);
app.use('/images', express.static('public/images'));
//rotte ancora da implementare
app.use(contextPath, orderRouter);
app.use(contextPath, couponRouter);
app.use(contextPath, showcaseRoutes);

// middleware per la gestione del caricamento file
app.use(fileUploadMiddleware);


// Endpoint per controllare lo stato del server per il frontend
app.get('/health', (req, res) => {
  // Restituisce un oggetto JSON che indica che il server è attivo
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
