const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// Create a PaymentIntent for the plan amount
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Optionally, create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: Math.round(amount),
        currency: currency.toUpperCase(),
        status: 'PENDING',
        // We'll store the Stripe PaymentIntent ID in razorpayPaymentId field for now
        razorpayPaymentId: paymentIntent.id,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Webhook endpoint for Stripe
const paymentWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update payment record to success
      await prisma.payment.updateMany({
        where: { razorpayPaymentId: paymentIntent.id },
        data: { status: 'SUCCESS' },
      });
      // Optionally, you can fulfill the order here.
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await prisma.payment.updateMany({
        where: { razorpayPaymentId: failedIntent.id },
        data: { status: 'FAILED' },
      });
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
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

    // Create a PaymentIntent for the plan price
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price, // price in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Confirm the PaymentIntent using a test payment method that always succeeds
    // In test mode, you can use pm_card_visa for a successful payment
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: 'pm_card_visa',
    });

    if (confirmedIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    // Update payment record with success status
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: 'USD',
        status: 'SUCCESS',
        razorpayPaymentId: confirmedIntent.id, // Stripe PaymentIntent ID
      },
    });

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        active: true,
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
    console.error('Subscribe to plan error:', error);
    res.status(500).json({ error: 'Failed to subscribe to plan' });
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

module.exports = {
  createPaymentIntent,
  paymentWebhook,
  subscribeToPlan,
  getSubscription,
  cancelSubscription,
};