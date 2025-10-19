const db = require('../services/db');

async function run(price) {
  let conn;
  try {
    conn = await db.getConnection();
    const rows = await db.execute(conn, 'SELECT id, name, price FROM products WHERE price = $1 LIMIT 20', [price]);
    console.log('rows:', rows);
  } catch (err) {
    console.error('error', err);
  } finally {
    if (conn) conn.done();
  }
}

const price = parseFloat(process.argv[2]);
if (!price) { console.error('Usage: node scripts/findProductsByPrice.js <price>'); process.exit(1); }
run(price);
