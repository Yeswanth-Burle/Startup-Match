const express = require('express');
const { getSkills, createSkill } = require('./skill.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getSkills);
router.post('/', protect, createSkill);

module.exports = router;
