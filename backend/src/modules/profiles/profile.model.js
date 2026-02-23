const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true }, // e.g., "Full Stack Developer", "Marketing Expert"

    // For Matching Engine
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    industry: {
        type: String,
        required: true,
        enum: ['Tech', 'Health', 'Finance', 'Education', 'E-commerce', 'Other']
    },
    // 1 to 10 scale
    experienceLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    // hours per week
    availability: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    // Extrovert/Introvert scale 1 to 10
    personalityOverlapIndicator: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },

    location: { type: String },

    // Contact & Verification
    phoneNumber: { type: String },
    socialLinks: {
        linkedin: { type: String },
        github: { type: String },
        website: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
