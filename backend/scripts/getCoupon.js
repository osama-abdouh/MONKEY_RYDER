const db = require('../services/db');

async function run(code) {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await db.execute(conn, 'SELECT * FROM coupon WHERE code = $1 LIMIT 1', [code]);
    console.log('rows:', rows);
  } catch (err) {
    console.error('error', err);
  } finally {
    if (conn) conn.done();
  }
}

const code = process.argv[2] || 'BLACKFRIDAY';
run(code);
