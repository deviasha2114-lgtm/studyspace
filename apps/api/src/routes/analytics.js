const express = require('express');
const router = express.Router();
const {
  getAnalyticsDashboard,
  getUserEngagementOverTime,
  getRevenueAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Analytics routes - all routes require authentication and admin privileges
router.use(protect);

// Get analytics dashboard
router.get('/dashboard', getAnalyticsDashboard);

// Get user engagement over time
router.get('/engagement', getUserEngagementOverTime);

// Get revenue analytics
router.get('/revenue', getRevenueAnalytics);

module.exports = router;