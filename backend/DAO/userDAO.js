const db = require('../services/db');


// colonne permesse come filtro (evita SQL injection)
const ALLOWED_COLUMNS = ['user_id', 'email', 'password_hash'];

const findAllUsers = async function (connection, reqQuery = {}) {
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
  const query = 'SELECT * FROM users WHERE user_id = $1';
  const result = await db.execute(connection, query, [userId]);
  return result[0] || null; // Restituisce singolo oggetto o null
};

const createUser = async function (connection, user) {
  sql = `INSERT INTO users 
         (email, password_hash) 
         VALUES ($1, $2)`;
  params = [user.email, user.password_hash];

  const result = await db.execute(connection, sql, params);

  if (result.affectedRows == 0) return null
  else return user;
};

const findUserByEmail = async function (connection, email) {
    const rows = await db.execute(connection, 'SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
}


module.exports = { findAllUsers, findUserById, createUser, findUserByEmail,};
