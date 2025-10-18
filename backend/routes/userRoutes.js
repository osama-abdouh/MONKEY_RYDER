const express = require('express');
const userController = require('../controllers/userController');


const router = express.Router();

router.get('/user', userController.getAllUsers);
router.get('/user/all', userController.getUsers);
router.get('/user/max-order', userController.getMaxOrder);
router.get('/user/role/:role', userController.findUserByRole);
router.get('/user/:userId/recent-orders', userController.getRecentOrders);
router.get('/user/orders-count', userController.ordersCountPerUser);
router.get('/user/:userId', userController.getUserById);
// GET /api/users/addresses -> get saved addresses for authenticated user
const authenticateToken = require('../middleware/authMiddleware');
router.get('/users/addresses', authenticateToken, userController.getSavedAddresses);
// POST /api/users/addresses -> save new address for authenticated user
router.post('/users/addresses', authenticateToken, userController.saveAddress);
router.patch('/user/:userId/status', userController.updateAccountStatus);
router.patch('/user/:userId/role', userController.updateUserRole);
router.get('/user/orders-count', userController.ordersCountPerUser);
router.delete('/user/:userId', userController.deleteUser);



module.exports = router;