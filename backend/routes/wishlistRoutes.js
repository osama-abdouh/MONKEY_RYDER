const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/wishlist/', authenticateToken, wishlistController.getWishlist);
router.post('/wishlist', authenticateToken, wishlistController.addToWishlist);
router.delete('/wishlist/:productId', authenticateToken, wishlistController.removeFromWishlist);
router.get('/wishlist/check/:productId', authenticateToken, wishlistController.isInWishlist);

module.exports = router;