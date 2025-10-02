const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../services/db');
const userDAO = require('../dao/userDao');

const router = express.Router();


router.post('/login', async function (req, res) {
    let conn;
    try {
        const { email, password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password mancante' });
        }
        if (!email) {
            return res.status(400).json({ error: 'Email mancante' });
        }

        conn = await db.getConnection();
        
        // Trova utente per email
        const userResult = await userDAO.findUserByEmail(conn, email);
        if (!userResult) {
            return res.status(400).json({ message: 'Email o password non corretti' });
        }
        
        const user = userResult;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ message: 'Email o password non corretti' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Autenticazione riuscita
        res.json({ message: 'Login successful', token });
        console.log(`User ${email} logged in successfully.`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Errore del server durante il login' });
    } finally {
        if (conn) conn.done(); // Rilascia la connessione se esiste
    }
});

module.exports = router;