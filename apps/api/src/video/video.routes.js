const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getVideoToken } = require('./video.controller');

// All video routes require authentication
router.use(authenticate);

/**
 * POST /api/video/:communityId/token
 * Get 100ms room token — membership verified inside controller
 */
router.post('/:communityId/token', getVideoToken);

module.exports = router;
