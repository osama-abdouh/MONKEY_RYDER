const db = require('../services/db');
const orderDAO = require('../DAO/orderDAO');

exports.getAllOrders = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const orders = await orderDAO.findAll(conn);
    res.json(orders);
  } catch (error) {
    console.error('controller/orderController.js getAllOrders', error);
    res.status(500).json({ message: 'Orders endpoint failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.createOrder = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { prezzo, payment_provider, payment_ref } = req.body || {};
    const user_id = req.user && req.user.userId;
    if (!user_id) return res.status(401).json({ message: 'Utente non autenticato' });
    if (prezzo == null) return res.status(400).json({ message: 'prezzo è obbligatorio' });
    const created = await orderDAO.createOrder(conn, { user_id, prezzo, payment_provider, payment_ref, payment_status: 'created' });
    if (!created) return res.status(500).json({ message: 'Creazione ordine fallita' });
    res.status(201).json(created);
  } catch (error) {
    console.error('controller/orderController.js createOrder', error);
    res.status(500).json({ message: 'Create order failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.confirmPayment = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { id_ordine, payment_ref, items } = req.body || {};
    if (!id_ordine) return res.status(400).json({ message: 'id_ordine obbligatorio' });
    // Only update payment_status and payment_ref, do NOT touch stato
    const updated = await orderDAO.markOrderPaid(conn, id_ordine, { payment_ref, payment_status: 'succeeded' });
    if (!updated) return res.status(404).json({ message: 'Ordine non trovato' });
  console.log('[DEBUG] confirmPayment called for order=%s itemsProvided=%s', id_ordine, Array.isArray(items) ? items.length : 0);
    // Process items and update products: uses a consolidated DAO function that
    // inserts provided items (if any) and updates products.quantity and products.sales_count
    if (typeof orderDAO.processOrderItemsAndUpdateProducts === 'function') {
      const ok = await orderDAO.processOrderItemsAndUpdateProducts(conn, id_ordine, items);
      console.log('[DEBUG] processOrderItemsAndUpdateProducts result for order=%s => %o', id_ordine, ok);
      if (!ok) console.warn('Failed processing order items for order', id_ordine);
    } else {
      // fallback: original behaviour
      if (items && Array.isArray(items) && items.length > 0) {
        const ok = await orderDAO.insertOrderItems(conn, id_ordine, items);
        console.log('[DEBUG] insertOrderItems fallback result for order=%s => %o', id_ordine, ok);
      } else {
        const ok = await orderDAO.updateProductsFromOrderItems(conn, id_ordine);
        console.log('[DEBUG] updateProductsFromOrderItems fallback result for order=%s => %o', id_ordine, ok);
      }
    }
    res.json(updated);
  } catch (error) {
    console.error('controller/orderController.js confirmPayment', error);
    res.status(500).json({ message: 'Confirm payment failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.getPendingOrders = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const orders = await orderDAO.findPending(conn);
    res.json(orders);
  } catch (error) {
    console.error('controller/orderController.js getPendingOrders', error);
    res.status(500).json({ message: 'Pending orders endpoint failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.cancelOrder = async function(req, res) {
  let conn;
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid order id' });
  try {
    conn = await db.getConnection();
    // verify order exists and is pending
    const found = await orderDAO.findById(conn, id);
    if (!found || !found.order) return res.status(404).json({ message: 'Order not found' });
    const stato = (found.order.stato || '').toString().toLowerCase();
    if (!['pending','in attesa'].includes(stato)) return res.status(400).json({ message: 'Order not pending, cannot delete' });

    const ok = await orderDAO.deleteOrderAndRestoreStock(conn, id);
    if (!ok) return res.status(500).json({ message: 'Failed to delete order' });
    res.json({ message: 'Order deleted and stock restored' });
  } catch (error) {
    console.error('controller/orderController.js cancelOrder', error);
    res.status(500).json({ message: 'Cancel order failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.updateDeliveryData = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const orderId = req.params.id;
    const { deliveryData } = req.body || {};
    // Diagnostic log to help debugging frontend payloads
    console.log('[DEBUG] updateDeliveryData controller received orderId=%s deliveryData=%o', orderId, deliveryData);
    if (!deliveryData || Object.keys(deliveryData).length === 0) {
      return res.status(400).json({ message: 'deliveryData mancante o vuoto' });
    }

    const updated = await orderDAO.updateDeliveryData(conn, orderId, deliveryData);
    if (!updated) return res.status(404).json({ message: 'Ordine non trovato' });
    res.json(updated);
  } catch (error) {
    console.error('controller/orderController.js updateDeliveryData', error);
    res.status(500).json({ message: 'Update delivery data failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
};

// Get tracking events for a specific order (authenticated)
exports.getOrderTracking = async function(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.userId;
    if (!user_id) return res.status(401).json({ message: 'Utente non autenticato' });
    const orderId = Number(req.params.id);
    if (!orderId) return res.status(400).json({ message: 'order id non valido' });
    conn = await db.getConnection();
    // verify ownership
    const data = await require('../DAO/orderDAO').findById(conn, orderId);
    if (!data || !data.order) return res.status(404).json({ message: 'Ordine non trovato' });
    if (data.order.user_id !== user_id) return res.status(403).json({ message: 'Accesso negato' });

  console.log('[DEBUG] getOrderTracking: verifying order ownership ok for orderId=%s userId=%s', orderId, user_id);
  const spediDAO = require('../DAO/spediDAO');
  const events = await spediDAO.getTrackingByOrderId(conn, orderId);
  console.log('[DEBUG] getOrderTracking: events fetched for orderId=%s count=%s', orderId, Array.isArray(events) ? events.length : 'non-array');
  if (Array.isArray(events) && events.length > 0) console.log('[DEBUG] getOrderTracking: first event=%o', events[0]);
  res.json({ tracking: events });
  } catch (error) {
    console.error('controller/orderController.js getOrderTracking', error);
    res.status(500).json({ message: 'Get order tracking failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

exports.getOrdersByUser = async function(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.userId;
    if (!user_id) return res.status(401).json({ message: 'Utente non autenticato' });
    conn = await db.getConnection();
    const orders = await orderDAO.findByUser(conn, user_id);
    res.json(orders);
  } catch (error) {
    console.error('controller/orderController.js getOrdersByUser', error);
    res.status(500).json({ message: 'Get user orders failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}

// Ottiene i dettagli di un singolo ordine (protetto)
exports.getOrderDetails = async function(req, res) {
  let conn;
  try {
    const user_id = req.user && req.user.userId;
    if (!user_id) return res.status(401).json({ message: 'Utente non autenticato' });
    const orderId = Number(req.params.id);
    if (!orderId) return res.status(400).json({ message: 'order id non valido' });
    conn = await db.getConnection();
    const data = await orderDAO.findById(conn, orderId);
    if (!data) return res.status(404).json({ message: 'Ordine non trovato' });
    // Verify the order belongs to the authenticated user
    if (data.order.user_id !== user_id) return res.status(403).json({ message: 'Accesso negato' });
    res.json(data);
  } catch (error) {
    console.error('controller/orderController.js getOrderDetails', error);
    res.status(500).json({ message: 'Get order details failed', error: error.message });
  } finally {
    if (conn) conn.done();
  }
}
