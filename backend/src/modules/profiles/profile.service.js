const Profile = require('./profile.model');

class ProfileService {
    async getProfileByUserId(userId) {
        const profile = await Profile.findOne({ user: userId }).populate('skills', 'name');
        if (!profile) {
            const error = new Error('Profile not found');
            error.statusCode = 404;
            throw error;
        }
        return profile;
    }

    async createOrUpdateProfile(userId, profileData) {
        let profile = await Profile.findOne({ user: userId });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: userId },
                { $set: profileData },
                { new: true, runValidators: true }
            ).populate('skills', 'name');
        } else {
            // Create
            profileData.user = userId;
            profile = await Profile.create(profileData);
            profile = await Profile.findById(profile._id).populate('skills', 'name');
        }

        return profile;
    }

    async getAllProfiles() {
        return await Profile.find().populate('skills', 'name').populate('user', 'email role');
    }
}

module.exports = new ProfileService();
