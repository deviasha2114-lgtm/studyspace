const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  subscribeToPlan,
  confirmSubscription,
  getSubscription,
  cancelSubscription,
  paymentWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Payment routes
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', paymentWebhook); // Webhook is public (or use secret verification)

// Subscription routes
router.post('/subscribe', protect, subscribeToPlan);
router.post('/confirm-subscription', protect, confirmSubscription);
router.get('/subscription', protect, getSubscription); // Get logged-in user's subscription
router.post('/cancel-subscription', protect, cancelSubscription);

module.exports = router;