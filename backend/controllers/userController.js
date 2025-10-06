const db = require('../services/db');
const userDAO = require('../dao/userDAO');

exports.getAllUsers = async function (req, res) {
    conn = await db.getConnection();
    try {
        res.json(await userDAO.findAllUsers(conn, req.query));
    } catch (error) {
        console.error('controller/userController.js', error);
        res.status(500).json({ 
            message: 'User endpoint failed', 
            error: error.message 
        });
    } finally {
        if (conn) conn.done(); // Rilascia la connessione se esiste
    }
}

exports.getUserById = async function (req, res) {
    conn = await db.getConnection();
    try {
        res.json(await userDAO.findUserById(conn, req.params.userId));
    } catch (error) {
        console.error('controller/userController.js', error);
        res.status(500).json({ 
            message: 'User endpoint failed', 
            error: error.message 
        });
    } finally {
        if (conn) conn.done();
    }
}