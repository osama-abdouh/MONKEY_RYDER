const db = require('../services/db');

async function run(orderId) {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await db.execute(conn, 'SELECT * FROM ordine_prodotti WHERE id_ordine = $1', [orderId]);
    console.log('rows:', rows);
  } catch (err) {
    console.error('error', err);
  } finally {
    if (conn) conn.done();
  }
}

const orderId = Number(process.argv[2]) || 0;
if (!orderId) { console.error('Usage: node scripts/listOrderItems.js <orderId>'); process.exit(1); }
run(orderId);
