const express = require('express');
const { getConnection } = require('../services/db');

const router = express.Router();

router.get('/test', async function (req, res) {
    try {
        // Query semplice per testare connessione DB
        const conn = await getConnection();
        const result = await conn.query('SELECT NOW() AS current_time');
        res.json({ 
            message: 'Test endpoint is working!', 
            db_connected: true, 
            current_time: result[0].current_time  // Cambiato da result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Test endpoint failed', 
            db_connected: false, 
            error: error.message 
        });
    }
});

module.exports = router;
