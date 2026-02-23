const applicationService = require('./application.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.applyToProject = async (req, res, next) => {
    try {
        const { projectId, coverLetter } = req.body;
        if (!projectId || !coverLetter) {
            throw Object.assign(new Error('Project ID and cover letter are required'), { statusCode: 400 });
        }
        const app = await applicationService.applyToProject(req.user.id, projectId, coverLetter);
        return sendSuccess(res, 201, 'Applied to project successfully', app);
    } catch (err) {
        next(err);
    }
};

exports.getMyApplications = async (req, res, next) => {
    try {
        const apps = await applicationService.getMyApplications(req.user.id);
        return sendSuccess(res, 200, 'Applications retrieved successfully', apps);
    } catch (err) {
        next(err);
    }
};

exports.getProjectApplications = async (req, res, next) => {
    try {
        const apps = await applicationService.getProjectApplications(req.user.id, req.params.projectId);
        return sendSuccess(res, 200, 'Project applications retrieved successfully', apps);
    } catch (err) {
        next(err);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const app = await applicationService.updateApplicationStatus(req.user.id, req.params.id, status);
        return sendSuccess(res, 200, 'Application status updated successfully', app);
    } catch (err) {
        next(err);
    }
};
