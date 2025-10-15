const db = require('../services/db');

// Return all orders with essential fields; join user for names
const findAll = async function(connection) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    u.first_name, u.last_name, u.email
    FROM ordini o
    LEFT JOIN users u ON u.user_id = o.user_id
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql);
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findAll error', err);
    return [];
  }
};

// Return only orders in pending status (accepts 'pending' or 'in attesa' in DB)
const findPending = async function(connection) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    u.first_name, u.last_name, u.email
    FROM ordini o
    LEFT JOIN users u ON u.user_id = o.user_id
    WHERE LOWER(COALESCE(o.stato, '')) IN ('pending','in attesa')
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql);
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findPending error', err);
    return [];
  }
};

// Cancel an order by id, only if currently pending; returns updated row
const cancelById = async function(connection, id) {
  const sql = `UPDATE ordini
    SET stato = 'annullato'
    WHERE id_ordine = $1 AND LOWER(COALESCE(stato,'')) IN ('pending','in attesa')
    RETURNING id_ordine, stato`;
  try {
    const rows = await db.execute(connection, sql, [id]);
    return rows && rows[0] ? rows[0] : null;
  } catch (err) {
    console.error('orderDAO.cancelById error', err);
    return null;
  }
};

module.exports = { findAll, findPending, cancelById };
