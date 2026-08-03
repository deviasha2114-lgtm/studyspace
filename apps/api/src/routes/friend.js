const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

// Friend requests (protected)
router.use(protect);
router.post('/request/:userId', friendController.sendFriendRequest);
router.get('/requests', friendController.getFriendRequests);
router.put('/request/:requestId/respond', friendController.respondToFriendRequest);

// Friends list (protected)
router.get('/friends', friendController.getFriends);

// Followers/Following (mixed visibility)
router.get('/:userId/followers', friendController.getFollowers);
router.get('/:userId/following', friendController.getFollowing);
router.post('/:userId/follow', friendController.followUser);
router.delete('/:userId/follow', friendController.unfollowUser);
router.get('/:userId/status', friendController.checkFriendshipStatus);

module.exports = router;