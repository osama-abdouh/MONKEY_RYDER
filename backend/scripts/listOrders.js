const db = require('../services/db');

async function run(limit = 30) {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await db.execute(conn, `SELECT id_ordine, user_id, prezzo, stato, datas, delivery_address, delivery_city, delivery_postal_code, delivery_phone FROM ordini ORDER BY id_ordine DESC LIMIT $1`, [limit]);
    console.log('rows:', rows);
  } catch (err) {
    console.error('error', err);
  } finally {
    if (conn) conn.done();
  }
}

const limit = process.argv[2] || 30;
run(Number(limit));
