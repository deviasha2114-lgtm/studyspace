const express = require('express');
const router = express.Router();
const { trackView } = require('../controllers/noteViewController');
const { authenticate } = require('../middleware/auth');
router.post('/:id/view', authenticate, trackView);
module.exports = router;
