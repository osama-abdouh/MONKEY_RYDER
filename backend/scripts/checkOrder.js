const db = require('../services/db');

async function run(id) {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await db.execute(conn, 'SELECT * FROM ordini WHERE id_ordine = $1', [id]);
    console.log('rows:', rows);
  } catch (err) {
    console.error('error', err);
  } finally {
    if (conn) conn.done();
  }
}

const id = process.argv[2] || 27;
run(Number(id));
