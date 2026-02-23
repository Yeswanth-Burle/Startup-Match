const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const profileRoutes = require('./modules/profiles/profile.routes');
const skillRoutes = require('./modules/skills/skill.routes');
const matchRoutes = require('./modules/matches/match.routes');
const projectRoutes = require('./modules/projects/project.routes');
const appRoutes = require('./modules/applications/application.routes');
const messageRoutes = require('./modules/messages/message.routes');
const notifRoutes = require('./modules/notifications/notification.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: 'Too many requests'
});
// Apply to all API routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/admin', analyticsRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running', data: {} });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
