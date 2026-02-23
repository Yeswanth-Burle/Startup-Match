const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/responseHandler');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        return sendSuccess(res, 201, 'User registered successfully', result);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Please provide an email and password');
            error.statusCode = 400;
            throw error;
        }

        const result = await authService.loginUser(email, password);
        return sendSuccess(res, 200, 'User logged in successfully', result);
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = req.user; // Set by protect middleware
        return sendSuccess(res, 200, 'User profile retrieved successfully', {
            id: user._id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};
