const express = require('express');
const db = require('../services/db');
const userDAO = require('../dao/userDAO');

const router = express.Router();

router.get('/user', async function (req, res) {
    conn = await db.getConnection();
    try {
        res.json(await userDAO.findUsers(conn, req.query));
    } catch (error) {
        res.status(500).json({ 
            message: 'User endpoint failed', 
            error: error.message 
        });
    } finally {
        if (conn) conn.done(); // Rilascia la connessione se esiste
    }
});

module.exports = router;