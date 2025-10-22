const db = require('../services/db');
const userDAO = require('../DAO/userDAO');
const bcrypt = require('bcrypt');

// Recupero di tutti gli utenti
exports.getAllUsers = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        res.json(await userDAO.getAllUsers(conn, req.query));
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
// Creazione di un nuovo utente
exports.createUser = async function (req, res) {
    let conn;
    try {
        const { first_name, last_name, email, password, role, birth_date, phone_number, account_status } = req.body;
        // Validatori di base
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: 'Campi obbligatori mancanti' });
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
            role: role || 'customer',
            account_status: account_status || 'active'
        };

        const created = await userDAO.createUser(conn, user);

        if (created) {
            console.log(`User ${email} created successfully.`);
            return res.status(201).json({ message: 'Utente creato con successo' });
        } else {
            return res.status(500).json({ message: 'Creazione utente fallita' });
        }
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

//???
exports.getUsers = async function (req, res) {
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
exports.ordersCountPerUser = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        const result = await userDAO.ordersCountPerUser(conn);
        res.json(result);
    } catch (error) {
        console.error('controller/userController.js ordersCountPerUser', error);
        res.status(500).json({ message: 'Failed to get orders count per user', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}

exports.deleteUser = async function (req, res) {
    let conn;
    try {
        conn = await db.getConnection();
        const userId = req.params.userId;
        const cascade = String(req.query.cascade || '').toLowerCase() === 'true';
        if (cascade) {
            // elimina prima gli ordini collegati, poi l'utente
            await userDAO.deleteOrdersByUser(conn, userId);
        }
        const result = await userDAO.deleteUser(conn, userId);
        if (!result) return res.status(404).json({ message: 'User not found' });
        res.json({ deleted: result, cascade });
    } catch (error) {
        console.error('controller/userController.js deleteUser', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}

exports.getSavedAddresses = async function(req, res) {
    let conn;
    try {
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ message: 'Utente non autenticato' });
        conn = await db.getConnection();
        const addresses = await userDAO.findAddressesByUser(conn, userId);
        res.json(addresses || []);
    } catch (error) {
        console.error('controller/userController.js getSavedAddresses', error);
        res.status(500).json({ message: 'Failed to get saved addresses', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}

exports.saveAddress = async function(req, res) {
    let conn;
    try {
        const userId = req.user && req.user.userId;
        if (!userId) return res.status(401).json({ message: 'Utente non autenticato' });
        const payload = req.body || {};
        // basic validation
        if (!payload.address || !payload.city) return res.status(400).json({ message: 'address e city sono obbligatori' });
        conn = await db.getConnection();
        const result = await userDAO.createAddress(conn, userId, payload);
        if (!result) return res.status(500).json({ message: 'Creazione indirizzo fallita' });
        if (result.existed) {
            return res.status(200).json({ message: 'Indirizzo già presente', address: result.row });
        }
        if (result.created) {
            return res.status(201).json(result.row);
        }
        // fallback
        return res.status(200).json(result.row || {});
    } catch (error) {
        console.error('controller/userController.js saveAddress', error);
        res.status(500).json({ message: 'Save address failed', error: error.message });
    } finally {
        if (conn) conn.done();
    }
}
