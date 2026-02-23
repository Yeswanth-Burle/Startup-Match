const express = require('express');
const { createProject, getProjects, getProject, updateProject, deleteProject } = require('./project.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProject)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;
