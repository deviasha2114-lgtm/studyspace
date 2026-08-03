const express = require('express');
const router = express.Router();
const studyRoomController = require('../controllers/studyRoomController');
const { protect } = require('../middleware/auth');

// Study room routes (protected)
router.use(protect);

// Create a new study room
router.post('/', studyRoomController.createStudyRoom);

// Get all study rooms (with filtering and pagination)
router.get('/', studyRoomController.getStudyRooms);

// Get a specific study room by ID
router.get('/:id', studyRoomController.getStudyRoomById);

// Join a study room
router.post('/:id/join', studyRoomController.joinStudyRoom);

// Leave a study room
router.delete('/:id/leave', studyRoomController.leaveStudyRoom);

// End a study room (host only)
router.delete('/:id/end', studyRoomController.endStudyRoom);

// Get study room messages
router.get('/:id/messages', studyRoomController.getStudyRoomMessages);

// Send a message in study room
router.post('/:id/messages', studyRoomController.sendStudyRoomMessage);

// Update study room settings
router.put('/:id/settings', studyRoomController.updateStudyRoomSettings);

module.exports = router;