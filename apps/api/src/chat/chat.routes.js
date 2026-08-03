const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { isMember } = require('../middleware/isMember.middleware');
const { chatRateLimiter } = require('../middleware/rateLimiter.middleware');
const { getMessages, sendMessage } = require('./chat.controller');

// All chat routes require authentication
router.use(authenticate);

/**
 * GET /api/chat/:communityId/messages?cursor=&limit=&page=
 * Fetch paginated message history (cursor-based)
 * 🔒 FIX: isMember check added — only community members can read history
 */
router.get('/:communityId/messages', isMember, getMessages);

/**
 * POST /api/chat/:communityId/messages
 * Send a new message — rate limited to 30/min per user
 * 🔒 isMember check added — only members can send messages
 */
router.post('/:communityId/messages', isMember, chatRateLimiter, sendMessage);

module.exports = router;
