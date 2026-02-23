const matchService = require('./match.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.generateMatches = async (req, res, next) => {
    try {
        const result = await matchService.generateMatchesForUser(req.user.id);
        return sendSuccess(res, 201, 'Matches generated successfully', result);
    } catch (error) {
        next(error);
    }
};

exports.getMyMatches = async (req, res, next) => {
    try {
        const matches = await matchService.getMyMatches(req.user.id);
        return sendSuccess(res, 200, 'Matches retrieved successfully', matches);
    } catch (error) {
        next(error);
    }
};

exports.acceptMatch = async (req, res, next) => {
    try {
        const match = await matchService.takeAction(req.user.id, req.params.id, 'ACCEPTED');
        return sendSuccess(res, 200, 'Match accepted successfully', match);
    } catch (error) {
        next(error);
    }
};

exports.rejectMatch = async (req, res, next) => {
    try {
        const match = await matchService.takeAction(req.user.id, req.params.id, 'REJECTED');
        return sendSuccess(res, 200, 'Match rejected successfully', match);
    } catch (error) {
        next(error);
    }
};
