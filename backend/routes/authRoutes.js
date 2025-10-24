const express = require('express');
const authController = require('../controllers/authController');
const {authenticateToken} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/is-admin', authenticateToken, authController.isAdmin);
router.post('/change-password', authenticateToken, authController.changePassword);


module.exports = router;