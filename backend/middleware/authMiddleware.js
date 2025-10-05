const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if(!token) return res.sendStatus(401).json({ message: 'Token mancante' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.sendStatus(403).json({ message: 'Token non valido' });
        }
        req.user = user; // Aggiungi i dati dell'utente alla richiesta
        next();
    });
}

module.exports = authenticateToken;