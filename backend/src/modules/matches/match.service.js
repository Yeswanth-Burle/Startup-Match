const Match = require('./match.model');
const Profile = require('../profiles/profile.model');

class MatchService {
    calculateScore(profile1, profile2) {
        let score = 0;
        const detailedScores = {
            skills: 0,
            industry: 0,
            availability: 0,
            experience: 0,
            personality: 0
        };

        // 1. Skill complementarity (40%)
        // Let's say if they have some overlap but also bring different skills, it's good.
        // simpler approach: union of skills -> more unique skills together = higher score, or just some basic overlap.
        const p1Skills = profile1.skills.map(s => s._id ? s._id.toString() : s.toString());
        const p2Skills = profile2.skills.map(s => s._id ? s._id.toString() : s.toString());

        // In a real startup, you want complementary skills (different skills). 
        // We score higher if they bring different skills to the table, and slightly higher if they have at least 1 common.
        const uniqueSkills = new Set([...p1Skills, ...p2Skills]);
        const commonSkills = p1Skills.filter(s => p2Skills.includes(s));

        let skillScore = 0;
        if (uniqueSkills.size > 0) {
            skillScore = Math.min(40, (uniqueSkills.size * 5) + (commonSkills.length > 0 ? 5 : 0));
        }
        detailedScores.skills = skillScore;
        score += skillScore;

        // 2. Industry alignment (20%)
        if (profile1.industry === profile2.industry) {
            detailedScores.industry = 20;
            score += 20;
        } else {
            // Maybe related industries get 10, but we'll assign 0 for simplicity.
            detailedScores.industry = 0;
        }

        // 3. Availability similarity (15%)
        // Difference in hours per week
        const availDiff = Math.abs(profile1.availability - profile2.availability);
        // Max difference might be around 80. Every 5 hours difference drops score.
        let availScore = 15 - (availDiff * 0.2);
        availScore = Math.max(0, availScore);
        detailedScores.availability = availScore;
        score += availScore;

        // 4. Experience balance (15%)
        // In co-founders, similar experience levels are good, or a mentor setup. Let's reward similar.
        const expDiff = Math.abs(profile1.experienceLevel - profile2.experienceLevel);
        // Max difference 9.
        let expScore = 15 - (expDiff * 1.5);
        expScore = Math.max(0, expScore);
        detailedScores.experience = expScore;
        score += expScore;

        // 5. Personality overlap (10%)
        // Assuming personality indicator 1-10
        const p1Pers = profile1.personalityOverlapIndicator || 5;
        const p2Pers = profile2.personalityOverlapIndicator || 5;
        const persDiff = Math.abs(p1Pers - p2Pers);
        let persScore = 10 - (persDiff * 1);
        persScore = Math.max(0, persScore);
        detailedScores.personality = persScore;
        score += persScore;

        return {
            total: Math.round(score),
            detailed: {
                skills: Math.round(detailedScores.skills),
                industry: Math.round(detailedScores.industry),
                availability: Math.round(detailedScores.availability),
                experience: Math.round(detailedScores.experience),
                personality: Math.round(detailedScores.personality),
            }
        };
    }

    async generateMatchesForUser(userId) {
        const myProfile = await Profile.findOne({ user: userId });
        if (!myProfile) {
            const error = new Error('Profile required to generate matches');
            error.statusCode = 400;
            throw error;
        }

        const allProfiles = await Profile.find({ user: { $ne: userId } });

        let generatedCount = 0;
        for (const profile of allProfiles) {
            // Check if match already exists
            const existingMatch = await Match.findOne({
                users: { $all: [userId, profile.user] }
            });

            if (!existingMatch) {
                const scoreResult = this.calculateScore(myProfile, profile);

                // Only create if score is reasonable, e.g., > 30, or just create all for demonstration
                if (scoreResult.total >= 30) {
                    const match = new Match({
                        users: [userId, profile.user].sort(), // keep predictable array order
                        score: scoreResult.total,
                        detailedScores: scoreResult.detailed
                    });
                    await match.save();
                    generatedCount++;
                }
            }
        }

        return { generatedCount };
    }

    async getMyMatches(userId) {
        // Find where I am one of the users
        const matches = await Match.find({ users: userId })
            .populate({
                path: 'users',
                select: 'email',
            })
            .sort({ score: -1 });

        // We populate the other user's profile to display
        const enrichedMatches = await Promise.all(matches.map(async (m) => {
            const otherUserId = m.users.find(u => u._id.toString() !== userId.toString());
            const otherProfile = await Profile.findOne({ user: otherUserId }).populate('skills', 'name');

            const isUser1 = m.users[0]._id.toString() === userId.toString();
            const myStatus = isUser1 ? m.statusUser1 : m.statusUser2;
            const otherStatus = isUser1 ? m.statusUser2 : m.statusUser1;

            return {
                _id: m._id,
                score: m.score,
                detailedScores: m.detailedScores,
                status: m.status,
                myStatus,
                otherStatus,
                otherUserId,
                otherProfile: otherProfile || {
                    firstName: 'Unknown',
                    lastName: 'User',
                    title: 'New Member',
                    bio: 'No profile set up yet.',
                    industry: 'Various',
                    location: 'Earth',
                    availability: 0,
                    experienceLevel: 0,
                    skills: []
                }
            };
        }));

        // Filter out if user rejected it
        return enrichedMatches.filter(m => m.myStatus !== 'REJECTED');
    }

    async takeAction(userId, matchId, action) {
        if (!['ACCEPTED', 'REJECTED'].includes(action)) {
            throw new Error('Invalid action');
        }

        const match = await Match.findById(matchId);
        if (!match) throw new Error('Match not found');

        const isUser1 = match.users[0].toString() === userId.toString();
        const isUser2 = match.users[1].toString() === userId.toString();

        if (!isUser1 && !isUser2) throw new Error('Not authorized to update this match');

        if (isUser1) match.statusUser1 = action;
        if (isUser2) match.statusUser2 = action;

        // Determine overall status
        if (match.statusUser1 === 'ACCEPTED' && match.statusUser2 === 'ACCEPTED') {
            match.status = 'ACCEPTED';
            // Ideally trigger notification event here
        } else if (match.statusUser1 === 'REJECTED' || match.statusUser2 === 'REJECTED') {
            match.status = 'REJECTED';
        } else {
            match.status = 'PENDING';
        }

        await match.save();
        return match;
    }
}

module.exports = new MatchService();
