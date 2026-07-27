const express = require('express');
const router = express.Router();
const { chat, getSessions } = require('../controllers/aiController');
const { authenticateRequired } = require('../middleware/auth');
router.post('/chat', authenticateRequired, chat);
router.get('/sessions/:noteId', authenticateRequired, getSessions);
module.exports = router;
