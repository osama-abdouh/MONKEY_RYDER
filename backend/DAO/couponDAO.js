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
module.exports = { findByCode, incrementUses };
