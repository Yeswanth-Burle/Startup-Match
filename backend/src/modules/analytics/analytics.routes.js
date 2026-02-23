const express = require('express');
const { getAnalytics } = require('./analytics.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getAnalytics);

module.exports = router;
