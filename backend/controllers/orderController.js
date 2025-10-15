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
