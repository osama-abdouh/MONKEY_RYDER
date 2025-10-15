const express = require('express');
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/orders -> list all orders (basic details)
router.get('/orders', orderController.getAllOrders);

// GET /api/orders/pending -> list only pending orders
router.get('/orders/pending', orderController.getPendingOrders);

// PATCH /api/orders/:id/cancel -> cancel a pending order by id
router.patch('/orders/:id/cancel', orderController.cancelOrder);

// POST /api/orders -> create an order (pending)
router.post('/orders', authenticateToken, orderController.createOrder);

// POST /api/orders/confirm-payment -> mark order as paid
router.post('/orders/confirm-payment', authenticateToken, orderController.confirmPayment);

module.exports = router;
