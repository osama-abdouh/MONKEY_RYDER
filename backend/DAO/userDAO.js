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
  const sql = `INSERT INTO users 
         (email, password_hash) 
         VALUES ($1, $2) RETURNING *`;
  const params = [user.email, user.password_hash];

  const result = await db.execute(connection, sql, params);

  // db.execute (pg-promise) returns an array of rows; RETURNING * returns the inserted row
  return result[0] || null;
};

const findUserByEmail = async function (connection, email) {
    const rows = await db.execute(connection, 'SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
}

const findUserByRole = async function (connection, role) {
  const rows = await db.execute(connection, 'SELECT * FROM users WHERE role = $1', [role]);
  return rows || null;
};

const maxOrder = async function (connection) {
  const params = [];

  const sql = `SELECT u.first_name, u.last_name, o.prezzo AS max_order
         FROM ordini o
         JOIN users u ON u.user_id = o.user_id
         ORDER BY o.prezzo DESC
         LIMIT 1`;
    const rows = await db.execute(connection, sql);
    if (!rows || rows.length === 0) return { max_order: 0, first_name: null, last_name: null };
    const r = rows[0];
    return { max_order: r.max_order != null ? Number(r.max_order) : 0, first_name: r.first_name, last_name: r.last_name };
  
};

const RecentOrders = async function (connection, limit = 3) {
  const sql = `
    SELECT o.id_ordine AS order_id, o.prezzo AS prezzo, o.datas AS data_ordine
    FROM ordini o
    ORDER BY o.datas DESC
    LIMIT $1`;
  const params = [limit];
  try {
    const rows = await db.execute(connection, sql, params);
    return rows || [];
  } catch (err) {
    console.error('userDAO.RecentOrders error', err);
    return [];
  }
};
const Users = async function (connection) {
  const sql = 'SELECT * FROM users';
  const rows = await db.execute(connection, sql);
  return rows || [];
};

const updateAccountStatus = async function (connection, userId, status) {
  const sql = `UPDATE users SET account_status = $1 WHERE user_id = $2 RETURNING *`;
  const params = [status, userId];
  const rows = await db.execute(connection, sql, params);
  return rows[0] || null;
};

const updateUserRole = async function (connection, userId, role) {
  const sql = `UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *`;
  const params = [role, userId];
  const rows = await db.execute(connection, sql, params);
  return rows[0] || null;
};

// Elimina definitivamente un utente dal DB (hard delete)
const deleteUser = async function (connection, userId) {
  const sql = `DELETE FROM users WHERE user_id = $1 RETURNING *`;
  const rows = await db.execute(connection, sql, [userId]);
  return rows[0] || null;
};
// Elimina tutti gli ordini associati ad un utente
const deleteOrdersByUser = async function (connection, userId) {
  const sql = `DELETE FROM ordini WHERE user_id = $1`;
  await db.execute(connection, sql, [userId]);
  return true;
};

const ordersCountPerUser = async function (connection) {
  // Conta il numero di ordini per ogni utente (inclusi utenti senza ordini)
  const sql = `
    SELECT u.user_id, u.email, u.first_name, u.last_name, COALESCE(COUNT(o.id_ordine), 0) AS orders_count
    FROM users u
    LEFT JOIN ordini o ON u.user_id = o.user_id
    GROUP BY u.user_id, u.email, u.first_name, u.last_name
    ORDER BY orders_count DESC, u.user_id ASC`;
  const rows = await db.execute(connection, sql);
  return rows || [];
};






module.exports = { findAllUsers, findUserById, createUser, findUserByEmail, findUserByRole, maxOrder, RecentOrders, updateAccountStatus, updateUserRole, Users, ordersCountPerUser, deleteUser, deleteOrdersByUser };
