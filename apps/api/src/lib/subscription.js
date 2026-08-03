const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if a user has an active subscription that includes a specific feature.
 * @param {string} userId - The user's ID
 * @param {string} feature - The feature string to check (e.g., 'Unlimited notes creation')
 * @returns {Promise<boolean>} - True if the user has access to the feature, false otherwise
 */
async function hasFeatureAccess(userId, feature) {
  // Find the user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      active: true,
    },
    include: {
      plan: true,
    },
  });

  if (!subscription || !subscription.plan) {
    // No active subscription, check if the feature is available in the free tier?
    // For now, we assume no access to premium features without subscription.
    // However, some features might be free. We'll need to define what is free.
    // Since we don't have a free plan in the Plan table, we can treat free as no subscription.
    // We'll return false for any feature check if no subscription.
    // But note: the app might have some free features by default.
    // We'll handle this by having the feature check return false for premium features when no subscription.
    // And we'll let the caller know what is free by not checking for those.
    // Alternatively, we can have a free plan in the database with price 0.
    // However, in our seed we did not create a free plan.
    // Let's assume that the free tier is the absence of a subscription and has limited features.
    // We'll not check for features in the free tier here; instead, we'll assume that the caller
    // knows which features are free and which are not.
    // For safety, we return false.
    return false;
  }

  // Check if the feature is in the plan's features
  const features = subscription.plan.features;
  if (Array.isArray(features)) {
    return features.includes(feature);
  }
  // If features is an object, we might need to adjust
  // For now, we assume it's an array of strings as per our seed.
  return false;
}

/**
 * Get the user's active subscription plan.
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} - The plan object or null if no active subscription
 */
async function getUserPlan(userId) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      active: true,
    },
    include: {
      plan: true,
    },
  });

  return subscription ? subscription.plan : null;
}

module.exports = {
  hasFeatureAccess,
  getUserPlan,
};