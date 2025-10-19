const db = require('../services/db');

// Return all orders with essential fields; join user for names
const findAll = async function(connection) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    o.payment_provider, o.payment_ref, o.payment_status,
    u.first_name, u.last_name, u.email
    FROM ordini o
    LEFT JOIN users u ON u.user_id = o.user_id
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql);
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findAll error', err);
    return [];
  }
};

// Return only orders in pending status (accepts 'pending' or 'in attesa' in DB)
const findPending = async function(connection) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    u.first_name, u.last_name, u.email
    FROM ordini o
    LEFT JOIN users u ON u.user_id = o.user_id
    WHERE LOWER(COALESCE(o.stato, '')) IN ('pending','in attesa')
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql);
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findPending error', err);
    return [];
  }
};

// Cancel an order by id, only if currently pending; returns updated row
const cancelById = async function(connection, id) {
  const sql = `UPDATE ordini
    SET stato = 'annullato'
    WHERE id_ordine = $1 AND LOWER(COALESCE(stato,'')) IN ('pending','in attesa')
    RETURNING id_ordine, stato`;
  try {
    const rows = await db.execute(connection, sql, [id]);
    return rows && rows[0] ? rows[0] : null;
  } catch (err) {
    console.error('orderDAO.cancelById error', err);
    return null;
  }
};

// Create a new order with basic payment fields
const createOrder = async function(connection, { user_id, prezzo, payment_provider, payment_ref, payment_status }) {
  const sql = `INSERT INTO ordini (user_id, prezzo, stato, payment_provider, payment_ref, payment_status)
               VALUES ($1, $2, 'pending', $3, $4, COALESCE($5, 'created'))
               RETURNING *`;
  const params = [user_id, prezzo, payment_provider || null, payment_ref || null, payment_status || null];
  const rows = await db.execute(connection, sql, params);
  return rows && rows[0] ? rows[0] : null;
};

// Mark order as paid: only update payment_status and payment_ref, do NOT touch stato
const markOrderPaid = async function(connection, id_ordine, { payment_ref, payment_status = 'succeeded' }) {
  const sql = `UPDATE ordini
               SET payment_status = $2, payment_ref = COALESCE($3, payment_ref)
               WHERE id_ordine = $1
               RETURNING *`;
  const rows = await db.execute(connection, sql, [id_ordine, payment_status, payment_ref || null]);
  return rows && rows[0] ? rows[0] : null;
};

// Update delivery details for an order
const updateDeliveryData = async function(connection, orderId, deliveryData) {
  const sql = `UPDATE ordini 
               SET delivery_address = $1, 
                   delivery_city = $2, 
                   delivery_postal_code = $3, 
                   delivery_phone = $4
               WHERE id_ordine = $5 RETURNING *`;
  // Support different payload shapes from frontend or other clients
  const address = deliveryData && (deliveryData.delivery_address || deliveryData.address) || null;
  const city = deliveryData && (deliveryData.delivery_city || deliveryData.city) || null;
  const postalCode = deliveryData && (deliveryData.delivery_postal_code || deliveryData.postalCode || deliveryData.postal_code) || null;
  const phone = deliveryData && (deliveryData.delivery_phone || deliveryData.phone) || null;

  const params = [address, city, postalCode, phone, orderId];
  console.log('[DEBUG] orderDAO.updateDeliveryData params=%o', params);
  const result = await db.execute(connection, sql, params);
  return result && result[0] ? result[0] : null;
};

module.exports = { findAll, findPending, cancelById, createOrder, markOrderPaid, updateDeliveryData };
// Return orders for a specific user
const findByUser = async function(connection, userId) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    o.payment_provider, o.payment_ref, o.payment_status
    FROM ordini o
    WHERE o.user_id = $1
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql, [userId]);
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findByUser error', err);
    return [];
  }
};

module.exports = { findAll, findPending, cancelById, createOrder, markOrderPaid, updateDeliveryData, findByUser };

// Find single order by id and return order + items (if ordine_prodotti table exists)
const findById = async function(connection, orderId) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    o.payment_provider, o.payment_ref, o.payment_status, o.delivery_address, o.delivery_city, o.delivery_postal_code, o.delivery_phone
    FROM ordini o
    WHERE o.id_ordine = $1`;
  try {
    const rows = await db.execute(connection, sql, [orderId]);
    if (!rows || rows.length === 0) return null;
    const order = rows[0];

    // Try to fetch order items from ordine_prodotti (if table exists). If it doesn't, return empty list.
    let items = [];
    try {
      const itemsSql = `SELECT 
          op.id as order_item_id,
          op.id_ordine,
          op.product_id,
          op.quantity,
          op.unit_price,
          p.id as product_id,
          p.name as product_name,
          p.price as product_price,
          p.description as product_description,
          p.image_url as product_image_url
        FROM ordine_prodotti op
        LEFT JOIN products p ON p.id = op.product_id
        WHERE op.id_ordine = $1
        ORDER BY op.id ASC`;
      items = await db.execute(connection, itemsSql, [orderId]);
  console.log('[DEBUG] orderDAO.findById fetched items count for order', orderId, items && items.length);
  console.log('[DEBUG] orderDAO.findById items:', JSON.stringify(items));
    } catch (err) {
      // Table might not exist or query failed; log and continue with empty items
      console.warn('orderDAO.findById: unable to read ordine_prodotti, returning empty items', err.message || err);
      items = [];
    }

    return { order, items };
  } catch (err) {
    console.error('orderDAO.findById error', err);
    return null;
  }
};

// export with new function
// Insert multiple order items for a given order
const insertOrderItems = async function(connection, orderId, items) {
  if (!Array.isArray(items) || items.length === 0) return true;
  try {
    // Insert each item (simple approach)
    for (const it of items) {
      const productId = it.product_id || it.productId || it.product || null;
      const quantity = it.quantity || it.qty || it.qta || 1;
      const unitPrice = it.unit_price || it.unitPrice || it.price || null;
      const sql = `INSERT INTO ordine_prodotti (id_ordine, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`;
      await connection.none(sql, [orderId, productId, quantity, unitPrice]);
    }
    return true;
  } catch (err) {
    console.error('orderDAO.insertOrderItems error', err);
    return false;
  }
};

module.exports = { findAll, findPending, cancelById, createOrder, markOrderPaid, updateDeliveryData, findByUser, findById, insertOrderItems };
