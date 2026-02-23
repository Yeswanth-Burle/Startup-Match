const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

require('./src/modules/users/user.model');
require('./src/modules/skills/skill.model');
const User = require('./src/modules/users/user.model');
const Profile = require('./src/modules/profiles/profile.model');

async function testDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        const out = ["Latest Users:"];
        users.forEach(u => out.push(`Email: ${u.email}`));

        const profiles = await Profile.find().populate('user', 'email').sort({ createdAt: -1 }).limit(5);
        out.push("\nLatest Profiles:");
        profiles.forEach(p => out.push(`User: ${p.user?.email || 'Unknown'}, Industry: ${p.industry}`));

        fs.writeFileSync('output_db.log', out.join('\n'));
        console.log("Wrote to output_db.log");
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('output_db.log', e.stack);
        console.error("Error", e);
        process.exit(1);
    }
}
testDB();
