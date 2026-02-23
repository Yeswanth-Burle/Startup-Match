const Notification = require('./notification.model');

class NotificationService {
    async getMyNotifications(userId) {
        return await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    }

    async getUnreadCount(userId) {
        return await Notification.countDocuments({ user: userId, read: false });
    }

    async markAsRead(userId, notificationId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { $set: { read: true } },
            { new: true }
        );
        if (!notification) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
        return notification;
    }

    async markAllAsRead(userId) {
        await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
        return { success: true };
    }

    // Utility to create internal notifications
    async createNotification(userId, title, message, type, relatedId = null) {
        return await Notification.create({
            user: userId,
            title,
            message,
            type,
            relatedId
        });
    }
}

module.exports = new NotificationService();
