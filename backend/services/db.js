const pgp = require('pg-promise')();
const config = require('../config');

// Crea l'istanza DB una volta sola
const db = pgp(config.db);

async function getConnection() {
    try {
        const connection = await db.connect();
        return connection;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

async function execute(connection, sql, params) {
  const results = await connection.any(sql, params);
  return results;
}


// Esporta l'istanza DB direttamente
module.exports = { getConnection, execute };