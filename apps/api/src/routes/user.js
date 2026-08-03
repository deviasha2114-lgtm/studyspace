const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/:userId', userController.getUserById);

// Protected routes (require authentication)
router.use(protect);
router.get('/me', userController.getMyProfile);
router.get('/profile/:userId', userController.getProfile);
router.put('/profile/:userId', userController.updateProfile);

module.exports = router;
