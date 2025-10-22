const db = require('../services/db');

const createUser = async function (connection, user) {
  const sql = `INSERT INTO users 
         (first_name, last_name, email, password_hash, birth_date, phone_number, role, account_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`;
  const params = [user.first_name, user.last_name, user.email, user.password_hash, user.birth_date, user.phone_number, user.role, user.account_status];

  const rows = await db.execute(connection, sql, params);
  return rows && rows[0] ? rows[0] : null;
};

const findUserByEmail = async function (connection, email) {
    const rows = await db.execute(connection, 'SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
}


// colonne permesse come filtro (evita SQL injection)
const ALLOWED_COLUMNS = ['id', 'email', 'password_hash'];

const findUsers = async function (connection, reqQuery = {}) {
  let sql = 'SELECT * FROM users'; // usa il nome reale della tabella
  const params = [];

  const keys = Object.keys(reqQuery || {}).filter(k => ALLOWED_COLUMNS.includes(k));
  if (keys.length) {
    const clauses = keys.map((k, idx) => {
      params.push(reqQuery[k]);
      return `${k} = $${idx + 1}`; // placeholder PostgreSQL
    });
    sql += ' WHERE ' + clauses.join(' AND ');
  }

  console.log('userDAO.findUsers -> SQL:', sql, 'params:', params);
  const rows = await db.execute(connection, sql, params); // rows è già un array
  return rows; // restituisce array (anche vuoto)
};

const findUserById = async function (connection, userId) {
  const rows = await db.execute(connection, 'SELECT * FROM utente WHERE id_utente = $1', [userId]);
  return rows[0] || null;
};

const updateLastLogin = async function (connection, userId) {
  const query = `UPDATE users
              SET last_login = NOW() 
              WHERE user_id = $1 
              RETURNING user_id, last_login`;
  const params = [userId];
  const rows = await db.execute(connection, query, params);
  
  return rows && rows[0] ? rows[0] : null;
};

module.exports = { createUser, findUserByEmail, findUsers, findUserById, updateLastLogin };
