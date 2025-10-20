const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non configurato in .env");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  console.log("Auth header ricevuto:", authHeader); // Aggiungi questo per debug

  const parts = authHeader.split(" ");
  const token =
    parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;

  console.log("Token estratto:", token ? "Presente" : "Mancante"); // Aggiungi questo

  if (!token) return res.status(401).json({ message: "Token mancante" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ message: "Token non valido" });
    }
    req.user = user;
    req.user.id = user.userId || user.id;
    console.log("User autenticato:", req.user.id); // Aggiungi questo
    next();
  });
}

module.exports = authenticateToken;
