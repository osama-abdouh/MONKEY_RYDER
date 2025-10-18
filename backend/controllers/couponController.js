const db = require('../services/db');
const couponDAO = require('../DAO/couponDAO');

exports.validateCoupon = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { code, orderTotal } = req.body || {};
    if (!code) return res.status(400).json({ message: 'code obbligatorio' });
    const coupon = await couponDAO.findByCode(conn, code);
    if (!coupon) return res.status(404).json({ valid: false, message: 'Coupon non trovato o non attivo' });

    // check validity window
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return res.status(400).json({ valid: false, message: 'Coupon non ancora valido' });
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return res.status(400).json({ valid: false, message: 'Coupon scaduto' });

    // min order amount
    if (coupon.min_order_amount && Number(orderTotal) < Number(coupon.min_order_amount)) {
      return res.status(400).json({ valid: false, message: "Ordine non raggiunge l'importo minimo" });
    }

    // uses limit
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return res.status(400).json({ valid: false, message: 'Coupon esaurito' });
    }

    // compute discount value
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = (Number(coupon.discount_value) / 100) * Number(orderTotal || 0);
    } else {
      discount = Number(coupon.discount_value || 0);
    }

    res.json({ valid: true, coupon: { coupon_id: coupon.coupon_id, code: coupon.code, discountType: coupon.discount_type, discountValue: coupon.discount_value, valid_from: coupon.valid_from, valid_until: coupon.valid_until }, discount });
  } catch (err) {
    console.error('couponController.validateCoupon', err);
    res.status(500).json({ message: 'Validate coupon failed', error: err.message });
  } finally {
    if (conn) conn.done();
  }
};

exports.redeemCoupon = async function(req, res) {
  let conn;
  try {
    conn = await db.getConnection();
    const { couponId } = req.body || {};
    if (!couponId) return res.status(400).json({ message: 'couponId obbligatorio' });
    // increment uses
    const updatedCoupon = await couponDAO.incrementUses(conn, couponId);
    res.json({ success: true, coupon: updatedCoupon });
  } catch (err) {
    console.error('couponController.redeemCoupon', err);
    res.status(500).json({ message: 'Redeem coupon failed', error: err.message });
  } finally {
    if (conn) conn.done();
  }
};
