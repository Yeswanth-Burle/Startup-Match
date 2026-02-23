const express = require('express');
const { getMyProfile, updateProfile, getProfiles, getProfileById } = require('./profile.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.post('/', protect, updateProfile);
router.put('/', protect, updateProfile);
router.get('/', protect, getProfiles);
router.get('/user/:id', protect, getProfileById);

module.exports = router;
