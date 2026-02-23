const skillService = require('./skill.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.getSkills = async (req, res, next) => {
    try {
        const skills = await skillService.getAllSkills();
        return sendSuccess(res, 200, 'Skills retrieved successfully', skills);
    } catch (error) {
        next(error);
    }
};

exports.createSkill = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            const error = new Error('Skill name is required');
            error.statusCode = 400;
            throw error;
        }

        const skill = await skillService.createSkill(name);
        return sendSuccess(res, 201, 'Skill created successfully', skill);
    } catch (error) {
        next(error);
    }
};
