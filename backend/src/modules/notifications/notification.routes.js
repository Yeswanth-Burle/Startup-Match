const express = require('express');
const { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('./notification.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
