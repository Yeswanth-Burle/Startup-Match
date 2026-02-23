const analyticsService = require('./analytics.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.getAnalytics = async (req, res, next) => {
    try {
        const stats = await analyticsService.getDashboardStats();
        return sendSuccess(res, 200, 'Analytics retrieved', stats);
    } catch (error) {
        next(error);
    }
};
