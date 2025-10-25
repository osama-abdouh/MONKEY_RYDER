const express = require('express');
const couponController = require('../controllers/couponController');

const router = express.Router();


router.post('/coupons/validate', couponController.validateCoupon);


router.post('/coupons/redeem', couponController.redeemCoupon);


router.post('/coupons', couponController.createCoupon);
// GET all coupons
router.get('/coupons', couponController.getAllCoupons);
// Update coupon
router.put('/coupons/:id', couponController.updateCoupon);
// Delete coupon
router.delete('/coupons/:id', couponController.deleteCoupon);

module.exports = router;
