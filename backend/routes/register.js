const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../services/db');
const userDAO = require('../dao/userDao');

const router = express.Router();

router.post('/register', async function (req, res) {
    let conn;
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email mancante' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password mancante' });
        }

        conn = await db.getConnection();
        const hashed = await bcrypt.hash(password, 10);

        const user = { 
            email,
            password_hash: hashed,
        };

        const created = await userDAO.createUser(conn, user);

        if (created) {
            console.log(`User ${email} registered successfully.`);
            return res.status(201).json({ message: 'Registrazione avvenuta con successo' });
        } else {
            return res.status(500).json({ message: 'Errore nella creazione dell\'utente' });
        }
    } catch (error) {
        console.error('register error:', error);
        return res.status(500).json({
            message: 'register endpoint failed',
            error: error.message
        });
    } finally {
        if (conn) conn.done(); // Rilascia la connessione se esiste
    }
});

module.exports = router;
