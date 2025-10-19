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

// Delete order and its items, and restore product quantities in a transaction
const deleteOrderAndRestoreStock = async function(connection, id) {
  try {
    // use pg-promise transaction API on the connection
    const result = await connection.tx(async t => {
      // fetch items for the order
      const items = await t.any('SELECT product_id, quantity FROM ordine_prodotti WHERE id_ordine = $1', [id]);

      // for each item, increase product quantity and decrement sales_count if product exists and quantity is numeric
      for (const it of items) {
        const pid = it.product_id;
        const qty = Number(it.quantity) || 0;
        if (pid && qty > 0) {
          // restore stock and decrease sales_count (don't allow sales_count to go below 0)
          await t.none('UPDATE products SET quantity = COALESCE(quantity,0) + $1, sales_count = GREATEST(COALESCE(sales_count,0) - $1, 0) WHERE id = $2', [qty, pid]);
        }
      }

      // delete items and the order itself
      await t.none('DELETE FROM ordine_prodotti WHERE id_ordine = $1', [id]);
      await t.none('DELETE FROM ordini WHERE id_ordine = $1', [id]);

      return true;
    });
    return result;
  } catch (err) {
    console.error('orderDAO.deleteOrderAndRestoreStock error', err);
    return false;
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

// Return orders for a specific user
const findByUser = async function(connection, userId) {
  const sql = `SELECT o.id_ordine, o.user_id, o.prezzo, o.datas, o.stato,
    o.payment_provider, o.payment_ref, o.payment_status
    FROM ordini o
    WHERE o.user_id = $1
    ORDER BY o.datas DESC`;
  try {
    const rows = await db.execute(connection, sql, [userId]);
// Find single order by id and return order + items (if ordine_prodotti table exists)
    return rows || [];
  } catch (err) {
    console.error('orderDAO.findByUser error', err);
    return [];
  }
};

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
      const itemsSql = `SELECT  op.id as order_item_id, op.id_ordine, op.product_id, op.quantity, op.unit_price, p.id as product_id, p.name as product_name, p.price as product_price,
          p.description as product_description, p.image_path as product_image_path
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
        let productId = it.product_id || it.productId || it.product || null;
        const quantity = it.quantity || it.qty || it.qta || 1;
        const unitPrice = it.unit_price || it.unitPrice || it.price || null;

        // If productId is not provided, try to resolve a likely product by price (best-effort)
        // This is a fallback for legacy clients or malformed payloads; it's not guaranteed to be correct.
        if (!productId && unitPrice != null) {
          try {
            // try to find a product with the same price
            const rows = await connection.any('SELECT id FROM products WHERE price = $1 LIMIT 1', [unitPrice]);
            if (rows && rows.length > 0) {
              productId = rows[0].id;
            }
          } catch (e) {
            // ignore lookup failures and proceed with null productId
            console.warn('insertOrderItems: product lookup by price failed', e && e.message ? e.message : e);
          }
        }

        const sql = `INSERT INTO ordine_prodotti (id_ordine, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`;
        await connection.none(sql, [orderId, productId, quantity, unitPrice]);
    }
    return true;
  } catch (err) {
    console.error('orderDAO.insertOrderItems error', err);
    return false;
  }
};


const processOrderItemsAndUpdateProducts = async function(connection, orderId, items) {
  try {
    const result = await connection.tx(async t => {
      
      const agg = new Map();

      if (Array.isArray(items) && items.length > 0) {
        // Insert provided items and build aggregator
        for (const it of items) {
          let productId = it.product_id || it.productId || it.product || null;
          const quantity = Number(it.quantity || it.qty || it.qta || 1) || 1;
          const unitPrice = it.unit_price || it.unitPrice || it.price || null;

          // Resolve productId by price as fallback
          if (!productId && unitPrice != null) {
            try {
              const rows = await t.any('SELECT id FROM products WHERE price = $1 LIMIT 1', [unitPrice]);
              if (rows && rows.length > 0) productId = rows[0].id;
            } catch (e) {
              console.warn('processOrderItemsAndUpdateProducts: product lookup by price failed', e && e.message ? e.message : e);
            }
          }

          // Insert order item row (productId may be null)
          await t.none('INSERT INTO ordine_prodotti (id_ordine, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [orderId, productId, quantity, unitPrice]);

          if (productId) agg.set(productId, (agg.get(productId) || 0) + quantity);
        }
      } else {
        // No items provided: read existing ordine_prodotti rows and aggregate
        const rows = await t.any('SELECT product_id, quantity FROM ordine_prodotti WHERE id_ordine = $1', [orderId]);
        for (const r of rows) {
          const pid = r.product_id;
          const q = Number(r.quantity) || 0;
          if (pid && q > 0) agg.set(pid, (agg.get(pid) || 0) + q);
        }
      }

      // Apply updates per product
      let totalAffected = 0;
      for (const [pid, totalQty] of agg) {
        const r = await t.result('UPDATE products SET quantity = GREATEST(COALESCE(quantity,0) - $1, 0), sales_count = COALESCE(sales_count,0) + $1 WHERE id = $2', [totalQty, pid]);
        if (r && typeof r.rowCount === 'number') totalAffected += r.rowCount;
      }

      return { success: true, itemsAggregated: agg.size, rowsAffected: totalAffected };
    });
    return result;
  } catch (err) {
    console.error('orderDAO.processOrderItemsAndUpdateProducts error', err);
    return false;
  }
};

module.exports = {findAll,findPending,cancelById,createOrder,markOrderPaid,updateDeliveryData,findByUser,findById,insertOrderItems,processOrderItemsAndUpdateProducts,deleteOrderAndRestoreStock};
