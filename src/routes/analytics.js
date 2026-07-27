const express = require('express');
const router = express.Router();
const { getCommunityAnalytics, getNoteAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { authenticateRequired } = require('../middleware/auth');
router.get('/community/:id', authenticateRequired, getCommunityAnalytics);
router.get('/notes/:id', authenticateRequired, getNoteAnalytics);
router.get('/user/:id', authenticateRequired, getUserAnalytics);
module.exports = router;
