const express = require('express');
const { generateMatches, getMyMatches, acceptMatch, rejectMatch } = require('./match.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/generate', protect, generateMatches);
router.get('/', protect, getMyMatches);
router.put('/:id/accept', protect, acceptMatch);
router.put('/:id/reject', protect, rejectMatch);

module.exports = router;
