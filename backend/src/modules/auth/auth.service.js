const User = require('../users/user.model');
const jwt = require('jsonwebtoken');

class AuthService {
    // Generate JWT
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });
    }

    async registerUser(userData) {
        const { email, password, role } = userData;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            const error = new Error('User already exists');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.create({
            email,
            password,
            role: role || 'FOUNDER'
        });

        const token = this.generateToken(user._id);

        return {
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            token
        };
    }

    async loginUser(email, password) {
        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        if (!user.isActive) {
            const error = new Error('User account is deactivated');
            error.statusCode = 403;
            throw error;
        }

        const token = this.generateToken(user._id);

        return {
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            token
        };
    }
}

module.exports = new AuthService();
