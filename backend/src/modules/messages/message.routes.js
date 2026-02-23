const express = require('express');
const { getConversation, sendMessage, markAsRead, getUnreadCount } = require('./message.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/unread-count', protect, getUnreadCount);
router.get('/:matchId', protect, getConversation);
router.post('/:matchId', protect, sendMessage);
router.put('/:matchId/read', protect, markAsRead);

module.exports = router;
