const User = require('../users/user.model');
const Match = require('../matches/match.model');
const Project = require('../projects/project.model');
const Profile = require('../profiles/profile.model');

class AnalyticsService {
    async getDashboardStats() {
        const totalUsers = await User.countDocuments();
        const totalProjects = await Project.countDocuments();
        const totalMatches = await Match.countDocuments();

        // Acceptance rate
        const acceptedMatches = await Match.countDocuments({ status: 'ACCEPTED' });
        const matchAcceptanceRate = totalMatches > 0 ? (acceptedMatches / totalMatches) * 100 : 0;

        // Most popular skills using aggregation
        const popularSkills = await Profile.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'skills',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'skillDetails'
                }
            },
            { $unwind: '$skillDetails' },
            {
                $project: {
                    name: '$skillDetails.name',
                    count: 1
                }
            }
        ]);

        return {
            totalUsers,
            totalProjects,
            totalMatches,
            matchAcceptanceRate: matchAcceptanceRate.toFixed(2),
            popularSkills
        };
    }
}

module.exports = new AnalyticsService();
