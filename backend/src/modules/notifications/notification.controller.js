const notificationService = require('./notification.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getMyNotifications(req.user.id);
        return sendSuccess(res, 200, 'Notifications retrieved', notifications);
    } catch (error) {
        next(error);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await notificationService.getUnreadCount(req.user.id);
        return sendSuccess(res, 200, 'Unread count retrieved', { unreadCount: count });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markAsRead(req.user.id, req.params.id);
        return sendSuccess(res, 200, 'Notification marked as read', notification);
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        return sendSuccess(res, 200, 'All notifications marked as read', {});
    } catch (error) {
        next(error);
    }
};
