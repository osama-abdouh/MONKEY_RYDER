const db = require('../services/db');

const findByCode = async function(connection, code) {
  const sql = `SELECT * FROM coupon WHERE code = $1 AND active = true LIMIT 1`;
  const rows = await db.execute(connection, sql, [code]);
  return rows && rows[0] ? rows[0] : null;
};

const incrementUses = async function(connection, couponId) {
  const sql = `UPDATE coupon SET uses_count = COALESCE(uses_count,0) + 1 WHERE coupon_id = $1 RETURNING *`;
  const rows = await db.execute(connection, sql, [couponId]);
  return rows && rows[0] ? rows[0] : null;
};

const assignToUser = async function(connection, userId, couponId) {
  const sql = `INSERT INTO usercoupon (user_id, coupon_id, used, used_at) VALUES ($1, $2, false, null) RETURNING *`;
  const rows = await db.execute(connection, sql, [userId, couponId]);
  return rows && rows[0] ? rows[0] : null;
};

const markUserCouponUsed = async function(connection, userId, couponId) {
  const sql = `UPDATE usercoupon SET used = true, used_at = NOW() WHERE user_id = $1 AND coupon_id = $2 RETURNING *`;
  const rows = await db.execute(connection, sql, [userId, couponId]);
  return rows && rows[0] ? rows[0] : null;
};

module.exports = { findByCode, incrementUses, assignToUser, markUserCouponUsed };
