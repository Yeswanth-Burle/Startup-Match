const messageService = require('./message.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.getConversation = async (req, res, next) => {
    try {
        const messages = await messageService.getConversation(req.user.id, req.params.matchId);
        return sendSuccess(res, 200, 'Messages retrieved', messages);
    } catch (error) {
        next(error);
    }
};

exports.sendMessage = async (req, res, next) => {
    try {
        const { content } = req.body;
        if (!content) throw Object.assign(new Error('Message content required'), { statusCode: 400 });
        const message = await messageService.sendMessage(req.user.id, req.params.matchId, content);
        return sendSuccess(res, 201, 'Message sent', message);
    } catch (error) {
        next(error);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await messageService.getUnreadCount(req.user.id);
        return sendSuccess(res, 200, 'Unread message count retrieved', count);
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        await messageService.markAsRead(req.user.id, req.params.matchId);
        return sendSuccess(res, 200, 'Messages marked as read', {});
    } catch (error) {
        next(error);
    }
};
