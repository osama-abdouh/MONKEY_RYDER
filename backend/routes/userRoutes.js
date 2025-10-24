const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/user', userController.getAllUsers);
router.post('/user', authenticateToken, isAdmin, userController.createUser);

router.get('/user/all', userController.getUsers);
router.get('/user/max-order', userController.getMaxOrder);
router.get('/user/role/:role', userController.findUserByRole);
router.get('/user/:userId/recent-orders', userController.getRecentOrders);
router.get('/user/orders-count', userController.ordersCountPerUser);
router.get('/user/:userId', userController.getUserById);


// GET /user/me -> dati dell'utente autenticato (deve comparire prima di /user/:userId)

router.get('/user/me', authenticateToken, userController.getCurrentUser);
// GET /api/users/addresses -> get saved addresses for authenticated user
router.get('/users/addresses', authenticateToken, userController.getSavedAddresses);
// PATCH /user/me -> aggiorna il profilo dell'utente autenticato
router.patch('/user/me', authenticateToken, userController.patchCurrentUser);
// route per user by id (attenzione: /user/me è definita prima per evitare collisioni)
router.get('/user/:userId', userController.getUserById);
// POST /api/users/addresses -> save new address for authenticated user
router.post('/users/addresses', authenticateToken, userController.saveAddress);
// POST /api/users/addresses/direct -> create address using createAddressDirect (creates table if missing)
router.post('/users/addresses/direct', authenticateToken, userController.saveAddressDirect);
// PUT /api/users/addresses/:id -> update existing address for authenticated user
router.put('/users/addresses/:id', authenticateToken, userController.updateAddress);
// DELETE /api/users/addresses/:id -> delete an address owned by authenticated user


router.delete('/users/addresses/:id', authenticateToken, userController.deleteAddress);
router.patch('/user/:userId/status', userController.updateAccountStatus);
router.patch('/user/:userId/role', userController.updateUserRole);
router.get('/user/orders-count', userController.ordersCountPerUser);
router.delete('/user/:userId', userController.deleteUser);



module.exports = router;