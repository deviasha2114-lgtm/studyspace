const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  getSystemStats,
  getRecentActivity
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Admin routes - all routes require authentication and admin privileges
router.use(protect);

// Get all users
router.get('/users', getAllUsers);

// Get user by ID
router.get('/users/:userId', getUserById);

// Update user role
router.put('/users/:userId/role', updateUserRole);

// Get system statistics
router.get('/stats', getSystemStats);

// Get recent activity
router.get('/activity', getRecentActivity);

module.exports = router;