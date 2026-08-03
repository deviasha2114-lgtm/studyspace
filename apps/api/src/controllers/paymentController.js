const { PrismaClient } = require('@prisma/client');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order for payment
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Convert amount to paise (since Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create a new order in Razorpay
    const options = {
      amount: amountInPaise,
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);

    // Optionally, create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountInPaise, // Store in paise for consistency
        currency: currency.toUpperCase(),
        status: 'PENDING',
        razorpayOrderId: order.id,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Create HMAC signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Verify signature
    if (generated_signature === razorpay_signature) {
      // Payment is valid, update payment status
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      // Invalid signature
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED' },
      });

      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// Subscribe to a plan
const subscribeToPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Find the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (!plan.active) {
      return res.status(400).json({ error: 'Plan is not active' });
    }

    // Check if user already has an active subscription
    const existingSub = await prisma.subscription.findFirst({
      where: { userId, active: true },
    });

    if (existingSub) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Create a Razorpay order for the plan price
    const amountInPaise = plan.price * 100; // Convert to paise
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(orderOptions);

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: amountInPaise,
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: order.id,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
      planId: plan.id,
    });
  } catch (error) {
    console.error('Subscribe to plan error:', error);
    res.status(500).json({ error: 'Failed to initiate subscription payment' });
  }
};

// Handle subscription confirmation after payment
const confirmSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      paymentId,
    } = req.body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Invalid signature
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED' },
      });

      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Payment is valid, update payment status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    // Find the plan to get details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        active: true,
        razorpaySubscriptionId: razorpay_payment_id, // Using payment ID as subscription ID for simplicity
        // startDate set by default
        // Optionally set endDate based on interval
      },
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        subscription,
        payment,
      },
    });
  } catch (error) {
    console.error('Confirm subscription error:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
};

// Get user's subscription
const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, active: true },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { userId, active: true },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Update subscription to inactive
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { active: false },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

// Webhook endpoint for Razorpay
const paymentWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Get the signature from headers
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    // Compare signature
    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle the event
    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        const paymentEntity = event.payload.payment.entity;
        // Update payment record to success
        await prisma.payment.updateMany({
          where: { razorpayPaymentId: paymentEntity.id },
          data: { status: 'SUCCESS' },
        });
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        await prisma.payment.updateMany({
          where: { razorpayPaymentId: failedPayment.id },
          data: { status: 'FAILED' },
        });
        break;

      case 'order.paid':
        const orderEntity = event.payload.order.entity;
        // Update payment record if needed
        await prisma.payment.updateMany({
          where: { razorpayOrderId: orderEntity.id },
          data: { status: 'SUCCESS' },
        });
        break;

      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  subscribeToPlan,
  confirmSubscription,
  getSubscription,
  cancelSubscription,
  paymentWebhook,
};