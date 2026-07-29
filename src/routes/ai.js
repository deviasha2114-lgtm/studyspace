const express = require('express');
const router = express.Router();
const { chat, getSessions } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/chat', authenticate, chat);
router.get('/sessions/:noteId', authenticate, getSessions);

module.exports = router;
