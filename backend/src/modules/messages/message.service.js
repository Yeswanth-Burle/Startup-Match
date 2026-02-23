const Message = require('./message.model');
const Match = require('../matches/match.model');

class MessageService {
    async getConversation(userId, matchId) {
        // Verify user is part of the match
        const match = await Match.findById(matchId);
        if (!match) throw Object.assign(new Error('Match not found'), { statusCode: 404 });

        if (!match.users.includes(userId)) {
            throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
        }

        const messages = await Message.find({ matchId })
            .populate('sender', 'email')
            .populate('receiver', 'email')
            .sort({ createdAt: 1 });

        return messages;
    }

    async sendMessage(senderId, matchId, content) {
        const match = await Match.findById(matchId);
        if (!match) throw Object.assign(new Error('Match not found'), { statusCode: 404 });

        if (!match.users.includes(senderId)) {
            throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
        }

        const receiverId = match.users.find(u => u.toString() !== senderId.toString());

        const message = new Message({
            matchId,
            sender: senderId,
            receiver: receiverId,
            content
        });

        await message.save();
        return await message.populate('sender receiver', 'email');
    }

    async getUnreadCount(userId) {
        const count = await Message.countDocuments({
            receiver: userId,
            read: false
        });
        return { unreadCount: count };
    }

    async markAsRead(userId, matchId) {
        await Message.updateMany(
            { matchId, receiver: userId, read: false },
            { $set: { read: true } }
        );
        return { success: true };
    }
}

module.exports = new MessageService();
