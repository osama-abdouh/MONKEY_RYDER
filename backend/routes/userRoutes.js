const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/user', userController.getAllUsers);
router.get('/user/:userId', userController.getUserById);

module.exports = router;