const Project = require('./project.model');

class ProjectService {
    async createProject(userId, projectData) {
        const project = new Project({
            ...projectData,
            owner: userId
        });
        await project.save();
        return await project.populate('requiredSkills', 'name');
    }

    async getAllProjects() {
        return await Project.find()
            .populate('owner', 'email')
            .populate('requiredSkills', 'name')
            .sort({ createdAt: -1 });
    }

    async getProjectById(projectId) {
        const project = await Project.findById(projectId)
            .populate('owner', 'email')
            .populate('requiredSkills', 'name');

        if (!project) {
            const error = new Error('Project not found');
            error.statusCode = 404;
            throw error;
        }
        return project;
    }

    async updateProject(userId, projectId, updateData) {
        let project = await this.getProjectById(projectId);

        if (project.owner._id.toString() !== userId.toString()) {
            const error = new Error('User not authorized to update this project');
            error.statusCode = 403;
            throw error;
        }

        project = await Project.findByIdAndUpdate(
            projectId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('requiredSkills', 'name');

        return project;
    }

    async deleteProject(userId, projectId) {
        const project = await this.getProjectById(projectId);

        if (project.owner._id.toString() !== userId.toString()) {
            const error = new Error('User not authorized to delete this project');
            error.statusCode = 403;
            throw error;
        }

        await Project.deleteOne({ _id: projectId });
        return { id: projectId };
    }
}

module.exports = new ProjectService();
