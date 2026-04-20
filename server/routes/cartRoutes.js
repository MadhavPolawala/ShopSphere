const express = require('express');
const router = express.Router();
const { getCart, updateCart, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart).post(protect, updateCart);
router.delete('/clear', protect, clearCart);
router.delete('/:productId', protect, removeCartItem);

module.exports = router;
