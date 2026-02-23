const projectService = require('./project.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.createProject = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.user.id, req.body);
        return sendSuccess(res, 201, 'Project created successfully', project);
    } catch (error) {
        next(error);
    }
};

exports.getProjects = async (req, res, next) => {
    try {
        const projects = await projectService.getAllProjects();
        return sendSuccess(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
        next(error);
    }
};

exports.getProject = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        return sendSuccess(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
        next(error);
    }
};

exports.updateProject = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
        return sendSuccess(res, 200, 'Project updated successfully', project);
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.user.id, req.params.id);
        return sendSuccess(res, 200, 'Project deleted successfully', {});
    } catch (error) {
        next(error);
    }
};
