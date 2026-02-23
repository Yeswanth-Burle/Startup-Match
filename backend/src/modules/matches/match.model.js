const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    detailedScores: {
        skills: Number,
        industry: Number,
        availability: Number,
        experience: Number,
        personality: Number
    },
    // Who initiated/viewed what
    statusUser1: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    statusUser2: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    // Overall match status
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
