const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../services/db");
const userDAO = require("../DAO/userDAO");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non configurato in .env");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const parts = authHeader.split(" ");
  const token =
    parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null; 
    // regex case-insensitive ( /^Bearer$/i ) per validare il prefisso “Bearer”

  console.log("Token estratto:", token ? "Presente" : "Mancante");// Log per debug presenza del token

  if (!token) return res.status(401).json({ message: "Token mancante" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if(err.name === "TokenExpiredError") {
        console.error("Token expired:", err);
        return res.status(401).json({ message: "Token scaduto" });
      }
      console.error("Token verification error:", err);
      return res.status(403).json({ message: "Token non valido" });
    }
    req.user = user;
    req.user.id = user.userId || user.id;
    console.log("User autenticato:", req.user.id);
    next();
  });
}

// Middleware per verificare che l'utente sia admin
const isAdmin = async (req, res, next) => {
    let conn;
    try {
        conn = await db.getConnection();
        const user = await userDAO.findUserById(conn, req.user.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Accesso negato: non sei un admin' });
        }
        next();
    } catch (error) {
        console.error('Errore verifica ruolo admin:', error);
        return res.status(500).json({ message: 'Errore del server' });
    } finally {
        if (conn) conn.done();
    }
};

module.exports = { authenticateToken, isAdmin };
