const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { chatRateLimiter } = require('../middleware/rateLimiter.middleware');
const { getMessages, sendMessage } = require('../controllers/chat.controller');

// All chat routes require authentication
router.use(authenticate);

/**
 * GET /api/chat/:communityId/messages?cursor=&limit=&page=
 * Fetch paginated message history (cursor-based)
 */
router.get('/:communityId/messages', getMessages);

/**
 * POST /api/chat/:communityId/messages
 * Send a new message — rate limited to 30/min per user
 */
router.post('/:communityId/messages', chatRateLimiter, sendMessage);

module.exports = router;
