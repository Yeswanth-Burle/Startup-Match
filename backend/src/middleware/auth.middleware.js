const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');
const { sendError } = require('../utils/responseHandler');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return sendError(res, 401, 'Not authorized to access this route');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return sendError(res, 401, 'User associated with token no longer exists');
        }

        if (!req.user.isActive) {
            return sendError(res, 403, 'User account is deactivated');
        }

        next();
    } catch (err) {
        return sendError(res, 401, 'Not authorized to access this route');
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };
