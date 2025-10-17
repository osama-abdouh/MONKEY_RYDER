const express = require('express');
const couponController = require('../controllers/couponController');

const router = express.Router();

// POST /api/coupons/validate -> validate coupon for an order
router.post('/coupons/validate', couponController.validateCoupon);

// POST /api/coupons/redeem -> mark coupon as used
router.post('/coupons/redeem', couponController.redeemCoupon);

module.exports = router;
