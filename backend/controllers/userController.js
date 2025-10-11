const db = require('../services/db');
const userDAO = require('../DAO/userDAO');

exports.getAllUsers = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
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
    let conn;
    try {
    conn = await db.getConnection();
    const userId = req.params.userId;
    res.json(await userDAO.findUserById(conn, userId));
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

exports.findUserByRole = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        res.json(await userDAO.findUserByRole(conn, req.params.role));
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

exports.getMaxOrder = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        res.json(await userDAO.maxOrder(conn));
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

exports.getRecentOrders = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        const userId = req.params.userId;
        res.json(await userDAO.RecentOrders(conn, userId));
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

exports.updateAccountStatus = async function (req, res) {
    let conn;
    try {
        console.log('updateAccountStatus called with params:', req.params);
        console.log('updateAccountStatus body:', req.body);
        conn = await db.getConnection();
    const userId = req.params.userId;
        const status = req.body && req.body.account_status ? req.body.account_status : null;
        if (!status) return res.status(400).json({ message: 'Missing account_status in body' });

        // Allowed values according to DB constraint
        const allowedStatuses = ['active', 'suspended', 'deleted'];

        // Map client-friendly values to DB-allowed values
        let dbStatus = status;
        if (status === 'blocked') dbStatus = 'suspended';

        // Validate final dbStatus before writing to DB to avoid constraint violations
        if (!allowedStatuses.includes(dbStatus)) {
            return res.status(400).json({ message: 'Invalid account_status', allowed: allowedStatuses });
        }

        const updated = await userDAO.updateAccountStatus(conn, userId, dbStatus);
        res.json(updated);
    } catch (error) {
        console.error('controller/userController.js updateAccountStatus', error);
        res.status(500).json({ message: 'Failed to update account status', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}
exports.getUsers = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        res.json(await userDAO.Users(conn));
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

exports.updateUserRole = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        const userId = req.params.userId;
        const role = req.body && req.body.role ? req.body.role : null;
        if (!role) return res.status(400).json({ message: 'Missing role in body' });

    const allowed = ['customer', 'admin'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role', allowed });

    // role is already 'admin' or 'customer' (no mapping needed)
    const dbRole = role === 'admin' ? 'admin' : 'customer';
        const updated = await userDAO.updateUserRole(conn, userId, dbRole);
        res.json(updated);
    } catch (error) {
        console.error('controller/userController.js updateUserRole', error);
        res.status(500).json({ message: 'Failed to update user role', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}
