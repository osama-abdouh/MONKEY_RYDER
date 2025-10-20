const db = require('../services/db');
const userDAO = require('../DAO/userDAO');

// middleware che assume che authenticateToken sia stato eseguito prima
// e che abbia impostato req.user.id
module.exports = async function isAdmin(req, res, next) {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    if (!userId) return res.status(401).json({ message: 'Utente non autenticato' });

    const conn = await db.getConnection();
    try {
      const ok = await userDAO.isUserAdmin(conn, userId);
      if (!ok) return res.status(403).json({ message: 'Permesso negato: solo admin' });
      next();
    } finally {
      conn.done();
    }
  } catch (err) {
    console.error('isAdmin middleware error', err);
    return res.status(500).json({ message: 'Errore server durante controllo ruolo' });
  }
};
