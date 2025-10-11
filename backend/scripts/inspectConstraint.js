const db = require('../services/db');

(async function() {
  let conn;
  try {
    conn = await db.getConnection();
    console.log('Connected to DB — inspecting CHECK constraints for table "users"...');

    const constraints = await db.execute(conn,
      "SELECT conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid = 'users'::regclass AND contype='c'");
    if (!constraints || constraints.length === 0) {
      console.log('No CHECK constraints found on table users.');
    } else {
      console.log('CHECK constraints found:');
      constraints.forEach(c => console.log('-', c.conname + ':', c.definition));
    }

    console.log('\nFetching distinct account_status values from users...');
    const vals = await db.execute(conn, "SELECT DISTINCT account_status FROM users");
    const distinct = (vals || []).map(r => r.account_status);
    console.log('Distinct account_status values:', distinct.length ? distinct : '[none]');

  } catch (err) {
    console.error('Error inspecting constraints:', err && err.message ? err.message : err);
  } finally {
    if (conn) conn && conn.done();
  }
})();
