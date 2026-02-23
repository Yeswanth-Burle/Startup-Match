const Application = require('./application.model');
const Project = require('../projects/project.model');
const NotificationService = require('../notifications/notification.service');

class ApplicationService {
    async applyToProject(userId, projectId, coverLetter) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }

        if (project.owner.toString() === userId.toString()) {
            throw Object.assign(new Error('You cannot apply to your own project'), { statusCode: 400 });
        }

        const application = new Application({
            project: projectId,
            applicant: userId,
            coverLetter
        });

        await application.save();
        return application;
    }

    async getMyApplications(userId) {
        return await Application.find({ applicant: userId })
            .populate({
                path: 'project',
                select: 'title status owner',
                populate: { path: 'owner', select: 'email' }
            });
    }

    async getProjectApplications(userId, projectId) {
        const project = await Project.findById(projectId);
        if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404 });

        const isOwner = project.owner.toString() === userId.toString();

        let isApprovedMember = false;
        if (!isOwner) {
            // Check if the user is an APPROVED applicant
            const myApplication = await Application.findOne({ project: projectId, applicant: userId, status: 'APPROVED' });
            if (myApplication) {
                isApprovedMember = true;
            }
        }

        if (!isOwner && !isApprovedMember) {
            throw Object.assign(new Error('Not authorized to view these applications'), { statusCode: 403 });
        }

        return await Application.find({ project: projectId })
            .populate({
                path: 'applicant',
                select: 'email',
                populate: {
                    path: 'profile',
                    populate: {
                        path: 'skills',
                        select: 'name'
                    }
                }
            });
    }

    async updateApplicationStatus(userId, applicationId, status) {
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
        }

        const application = await Application.findById(applicationId).populate({
            path: 'project',
            populate: { path: 'owner', select: 'email' }
        });
        if (!application) throw Object.assign(new Error('Application not found'), { statusCode: 404 });

        if (application.project.owner._id.toString() !== userId.toString()) {
            throw Object.assign(new Error('Not authorized to update this application'), { statusCode: 403 });
        }

        application.status = status;
        await application.save();

        // Send Notification to Applicant
        if (status === 'APPROVED') {
            await NotificationService.createNotification(
                application.applicant,
                'Application Approved! 🎉',
                `Hey congrats! You got accepted for the project "${application.project.title}" by ${application.project.owner.email}. You can view the team section for more details.`,
                'APPLICATION',
                application.project._id
            );
        } else if (status === 'REJECTED') {
            await NotificationService.createNotification(
                application.applicant,
                'Application Update',
                `Hey, sorry but you were rejected by ${application.project.owner.email} for the project "${application.project.title}". Keep looking for other great opportunities!`,
                'APPLICATION',
                application.project._id
            );
        }

        return application;
    }
}

module.exports = new ApplicationService();
