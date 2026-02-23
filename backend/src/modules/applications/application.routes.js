const express = require('express');
const { applyToProject, getMyApplications, getProjectApplications, updateApplicationStatus } = require('./application.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, applyToProject);
router.get('/my-applications', protect, getMyApplications);
router.get('/project/:projectId', protect, getProjectApplications);
router.put('/:id/status', protect, updateApplicationStatus);

module.exports = router;
