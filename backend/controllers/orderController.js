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
    // If items were provided (from frontend cart), persist them into ordine_prodotti
    if (items && Array.isArray(items) && items.length > 0) {
      const ok = await orderDAO.insertOrderItems(conn, id_ordine, items);
      if (!ok) {
        console.warn('Some order items could not be saved for order', id_ordine);
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
    const updated = await orderDAO.cancelById(conn, id);
    if (!updated) return res.status(404).json({ message: 'Order not found or not pending' });
    res.json({ message: 'Order cancelled', order: updated });
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
