const profileService = require('./profile.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.getMyProfile = async (req, res, next) => {
    try {
        const profile = await profileService.getProfileByUserId(req.user.id);
        return sendSuccess(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const profile = await profileService.createOrUpdateProfile(req.user.id, req.body);
        return sendSuccess(res, 200, 'Profile saved successfully', profile);
    } catch (error) {
        next(error);
    }
};

exports.getProfiles = async (req, res, next) => {
    try {
        const profiles = await profileService.getAllProfiles();
        return sendSuccess(res, 200, 'Profiles retrieved successfully', profiles);
    } catch (error) {
        next(error);
    }
};

exports.getProfileById = async (req, res, next) => {
    try {
        // Treat the param as user id for convenience, or profile id depending on route
        const profile = await profileService.getProfileByUserId(req.params.id);
        return sendSuccess(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
        next(error);
    }
};
