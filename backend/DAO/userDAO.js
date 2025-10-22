const db = require('../services/db');


// colonne permesse come filtro (evita SQL injection)
const ALLOWED_COLUMNS = ['user_id', 'first_name', 'last_name', 'email', 'birth_date', 'phone_number', 'role', 'account_status', 'created_at', 'last_login'];

// Recupero degli utenti
const getAllUsers = async function (connection) {
  const query = 'SELECT * FROM users';
  const result = await db.execute(connection, query);
  return result;
};


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
  const query = `INSERT INTO users 
         (first_name, last_name, email, password_hash, birth_date, phone_number, role, account_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`;
  const params = [user.first_name, user.last_name, user.email, user.password_hash, user.birth_date, user.phone_number, user.role, user.account_status];
  const result = await db.execute(connection, query, params);
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




module.exports = { 
  getAllUsers, findAllUsers, findUserById, createUser, findUserByEmail, findUserByRole, maxOrder, 
  RecentOrders, updateAccountStatus, updateUserRole, ordersCountPerUser, deleteUser, deleteOrdersByUser };

// Return addresses for a specific user (attempt common Italian table 'indirizzi')
const findAddressesByUser = async function(connection, userId) {
  // Try common Italian schema first
  const sqlIt = `SELECT id, user_id, nome_campanello AS fullName, indirizzo AS address, citta AS city, cap AS postalCode, telefono AS phone FROM indirizzi WHERE user_id = $1 ORDER BY id DESC`;
  try {
    const rows = await db.execute(connection, sqlIt, [userId]);
    if (rows && rows.length) return rows.map(r => ({ id: r.id, fullName: r.fullname || r.fullName || r.nome_campanello, address: r.address || r.indirizzo, city: r.city || r.citta, postalCode: r.postalcode || r.postalCode || r.cap, phone: r.phone || r.telefono }));
  } catch (err) {
    // ignore and try english-style table
    console.warn('userDAO.findAddressesByUser: indirizzi table not found or query failed, trying addresses table', err.message);
  }

  // Fallback to a generic 'addresses' table if present
  const sqlEn = `SELECT id, user_id, label AS fullName, address, city, postal_code AS postalCode, phone FROM addresses WHERE user_id = $1 ORDER BY id DESC`;
  try {
    const rows2 = await db.execute(connection, sqlEn, [userId]);
    if (rows2 && rows2.length) return rows2.map(r => ({ id: r.id, fullName: r.fullname || r.fullName || r.label, address: r.address, city: r.city, postalCode: r.postalcode || r.postalCode || r.postal_code, phone: r.phone }));
  } catch (err2) {
    console.error('userDAO.findAddressesByUser: no addresses table found or query failed', err2.message);
  }

  return [];
};

module.exports.findAddressesByUser = findAddressesByUser;

// Create a new address for a user. Try italian 'indirizzi' table first, fallback to 'addresses'.
const createAddress = async function(connection, userId, addr) {
  // normalize incoming fields
  const fullName = addr.fullName || addr.name || addr.label || null;
  const address = addr.address || addr.street || null;
  const city = addr.city || null;
  const postalCode = addr.postalCode || addr.zip || addr.cap || null;
  const phone = addr.phone || null;

  // Try to find existing in italian table
  try {
    const checkIt = `SELECT * FROM indirizzi WHERE user_id = $1 AND LOWER(COALESCE(indirizzo,'')) = LOWER(COALESCE($2,'')) AND LOWER(COALESCE(citta,'')) = LOWER(COALESCE($3,'')) AND COALESCE(cap,'') = COALESCE($4,'') LIMIT 1`;
    const exists = await db.execute(connection, checkIt, [userId, address || '', city || '', postalCode || '']);
    if (exists && exists[0]) return { existed: true, row: exists[0] };
  } catch (err) {
    // ignore and continue to try insert/fallback
  }

  // Try insert into italian table
  const sqlIt = `INSERT INTO indirizzi (user_id, nome_campanello, indirizzo, citta, cap, telefono) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  try {
    const rows = await db.execute(connection, sqlIt, [userId, fullName, address, city, postalCode, phone]);
    if (rows && rows[0]) return { created: true, row: rows[0] };
  } catch (err) {
    console.warn('userDAO.createAddress: inserimento indirizzi fallito, provando fallback addresses table', err.message);
  }

  // Fallback to english-style table
  const sqlEn = `INSERT INTO addresses (user_id, label, address, city, postal_code, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  // Fallback: check existing in english-style table
  try {
    const checkEn = `SELECT * FROM addresses WHERE user_id = $1 AND LOWER(COALESCE(address,'')) = LOWER(COALESCE($2,'')) AND LOWER(COALESCE(city,'')) = LOWER(COALESCE($3,'')) AND COALESCE(postal_code,'') = COALESCE($4,'') LIMIT 1`;
    const exists2 = await db.execute(connection, checkEn, [userId, address || '', city || '', postalCode || '']);
    if (exists2 && exists2[0]) return { existed: true, row: exists2[0] };
  } catch (err) {
    // ignore
  }

  try {
    const rows2 = await db.execute(connection, sqlEn, [userId, fullName, address, city, postalCode, phone]);
    if (rows2 && rows2[0]) return { created: true, row: rows2[0] };
  } catch (err2) {
    console.error('userDAO.createAddress: fallback insert failed', err2.message);
  }

  return null;
};

module.exports.createAddress = createAddress;
