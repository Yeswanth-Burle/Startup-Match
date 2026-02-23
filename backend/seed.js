const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/modules/users/user.model');
const Skill = require('./src/modules/skills/skill.model');
const connectDB = require('./src/config/db');

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Check for admin
        const adminExists = await User.findOne({ email: 'admin@startupmatch.com' });
        if (!adminExists) {
            await User.create({
                email: 'admin@startupmatch.com',
                password: 'adminpassword123',
                role: 'ADMIN',
                isActive: true
            });
            console.log('Admin user seeded: admin@startupmatch.com');
        }

        // Add some default skills
        const skills = [
            'React', 'Node.js', 'MongoDB', 'AWS', 'Python',
            'Marketing', 'Sales', 'Finance', 'UI/UX Design', 'Product Management'
        ];

        for (const skill of skills) {
            const existing = await Skill.findOne({ name: skill.toLowerCase() });
            if (!existing) {
                await Skill.create({ name: skill });
            }
        }
        console.log('Default skills seeded');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
