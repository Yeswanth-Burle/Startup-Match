const Skill = require('./skill.model');

class SkillService {
    async getAllSkills() {
        return await Skill.find().sort({ name: 1 });
    }

    async createSkill(name) {
        const existing = await Skill.findOne({ name: name.toLowerCase() });
        if (existing) {
            return existing;
        }
        return await Skill.create({ name });
    }

    async getSkillById(id) {
        const skill = await Skill.findById(id);
        if (!skill) {
            const error = new Error('Skill not found');
            error.statusCode = 404;
            throw error;
        }
        return skill;
    }
}

module.exports = new SkillService();
