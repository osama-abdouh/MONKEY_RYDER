const db = require('../services/db');
const authDAO = require('../DAO/authDAO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDAO = require('../DAO/userDAO');
const dbService = require('../services/db');


exports.login = async function (req, res) {
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
        const userResult = await authDAO.findUserByEmail(conn, email);
        if (!userResult) {
            return res.status(400).json({ message: 'Email o password non corretti' });
        }
        
        const user = userResult;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(400).json({ message: 'Email o password non corretti' });
        }

        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Autenticazione riuscita
        res.json({ message: 'Login successful', token });
        console.log(`User ${email} logged in successfully.`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Errore del server durante il login' });
    } finally {
        if (conn) conn.done(); // Rilascia la connessione se esiste
    }
};

exports.register = async function (req, res) {
    let conn;
    try {
        const { email, password, first_name, last_name, birth_date, phone_number } = req.body;

        //validator
        if (!email) {
            return res.status(400).json({ message: 'Email mancante' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password mancante' });
        }
        if (!first_name) {
            return res.status(400).json({ message: 'Nome mancante' });
        }
        if (!last_name) {
            return res.status(400).json({ message: 'Cognome mancante' });
        }

        conn = await db.getConnection();
        const hashed = await bcrypt.hash(password, 10);

        const user = { 
            email,
            password_hash: hashed,
            first_name,
            last_name,
            birth_date: birth_date || null,
            phone_number: phone_number || null,
            role: 'customer', // default role
            account_status: 'active' // default status
        };

        const created = await authDAO.createUser(conn, user);

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
};

// Endpoint che ritorna se l'utente autenticato è admin
exports.isAdmin = async function (req, res) {
    let conn;
    try {
        const userId = req.user && (req.user.userId || req.user.id);
        if (!userId) return res.status(401).json({ message: 'Utente non autenticato' });

        conn = await dbService.getConnection();
        const ok = await userDAO.isUserAdmin(conn, userId);
        return res.json({ isAdmin: !!ok });
    } catch (err) {
        console.error('isAdmin handler error', err);
        return res.status(500).json({ message: 'Errore server durante controllo ruolo' });
    } finally {
        if (conn) conn && conn.done && conn.done();
    }
};