const db = require('../services/db');

const findByCode = async function(connection, code) {
  // Accept coupons when active = true OR active is NULL (for older rows without the column set)
  // If you prefer strict behavior, add an `active` column to the table and set it to true/false.
  const sql = `SELECT * FROM coupon WHERE code = $1 AND (active IS NULL OR active = true) LIMIT 1`;
  const rows = await db.execute(connection, sql, [code]);
  return rows && rows[0] ? rows[0] : null;
};

const incrementUses = async function(connection, couponId) {
  const sql = `UPDATE coupon SET uses_count = COALESCE(uses_count,0) + 1 WHERE coupon_id = $1 RETURNING *`;
  const rows = await db.execute(connection, sql, [couponId]);
  return rows && rows[0] ? rows[0] : null;
};

const createCoupon = async function(connection, payload) {
  // whitelist columns that are allowed to be inserted
  const deny = new Set(['coupon_id', 'created_at', 'updated_at']);
  const keys = Object.keys(payload || {}).filter(k => !deny.has(String(k).toLowerCase()));
  if (keys.length === 0) throw new Error('No valid fields provided for coupon');

  const colsSql = keys.join(', ');
  const params = keys.map(k => payload[k]);
  const valuesSql = keys.map((_, i) => `$${i+1}`).join(', ');
  const sql = `INSERT INTO coupon (${colsSql}) VALUES (${valuesSql}) RETURNING *`;
  const rows = await db.execute(connection, sql, params);
  return rows && rows[0] ? rows[0] : null;
};

const getAllCoupons = async function(connection) {
  const sql = `SELECT * FROM coupon ORDER BY coupon_id DESC`;
  try {
    const rows = await db.execute(connection, sql);
    return rows || [];
  } catch (err) {
    console.error('Error in getAllCoupons DAO:', err && err.message ? err.message : err);
    throw err;
  }
};

const updateCoupon = async function(connection, couponId, payload) {
  const denyColumn = 'coupon_id';
  const provided = Object.assign({}, payload || {});

  try {
    const colSql = `SELECT column_name FROM information_schema.columns WHERE table_name = 'coupon'`;
    const colRows = await db.execute(connection, colSql);
    const allowedCols = new Set((colRows || []).map(r => String(r.column_name)));

    const keys = Object.keys(provided).filter(k => allowedCols.has(k) && k !== denyColumn);
    if (keys.length === 0) throw new Error('No valid fields provided for update');

    
    const setSql = keys.map((k, i) => `${k} = $${i+1}`).join(', ');
    const params = keys.map(k => (provided[k] === undefined ? null : provided[k]));
    params.push(couponId);
    const sql = `UPDATE coupon SET ${setSql} WHERE coupon_id = $${params.length} RETURNING *`;

    const rows = await db.execute(connection, sql, params);
    return rows && rows[0] ? rows[0] : null;
  } catch (err) {
    console.error('Error in updateCoupon DAO:', err && err.message ? err.message : err);
    throw err;
  }
};

const deleteCoupon = async function(connection, couponId) {
  const sql = `DELETE FROM coupon WHERE coupon_id = $1 RETURNING *`;
  try {
    const rows = await db.execute(connection, sql, [couponId]);
    return rows && rows[0] ? rows[0] : null;
  } catch (err) {
    console.error('Error in deleteCoupon DAO:', err && err.message ? err.message : err);
    throw err;
  }
};


module.exports = { findByCode, incrementUses, createCoupon, getAllCoupons, updateCoupon, deleteCoupon };





