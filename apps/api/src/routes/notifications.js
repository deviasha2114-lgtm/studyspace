const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, getNotifications);

// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', protect, markAsRead);

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, markAllAsRead);

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', protect, deleteNotification);

// DELETE /api/notifications/delete-read
router.delete('/delete-read', protect, deleteReadNotifications);

module.exports = router;