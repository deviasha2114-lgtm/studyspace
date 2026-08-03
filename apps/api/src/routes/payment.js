const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  paymentWebhook,
  subscribeToPlan,
  getSubscription,
  cancelSubscription,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Payment routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', paymentWebhook); // Webhook is public (or use secret verification)

// Subscription routes
router.post('/subscribe', protect, subscribeToPlan);
router.get('/:userId', protect, getSubscription);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;