const db = require('../services/db');

const getTrackingByOrderId = async function(connection, orderId) {
	if (!connection) throw new Error('Connection is required');
	if (orderId == null) return [];

	// Join ordini to also fetch the order status for the given orderId.
	// The returned rows will include an extra column `ordine_stato`.
	const sql = `SELECT t.id_tracking, t.id_ordine, t.data_evento, t.localita, t.stato_pacco, t.note, t.corriere
			 FROM tracking t
			 WHERE t.id_ordine = $1
			 ORDER BY t.data_evento ASC`;
	try {
		const rows = await db.execute(connection, sql, [orderId]);
		return rows || [];
	} catch (err) {
		console.error('spediDAO.getTrackingByOrderId error', err && err.message ? err.message : err);
		return [];
	}
};

module.exports = { getTrackingByOrderId };

