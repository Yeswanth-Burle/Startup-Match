const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const Profile = require('./src/modules/profiles/profile.model');
const MatchService = require('./src/modules/matches/match.service');

async function testMatch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const profiles = await Profile.find();
        const output = [];
        output.push("Found profiles: " + profiles.length);

        for (const p of profiles) {
            output.push(`User ID: ${p.user} | Industry: ${p.industry} | Exp: ${p.experienceLevel} | Avail: ${p.availability} | Skills: ${p.skills?.length}`);
        }

        if (profiles.length >= 2) {
            for (let i = 0; i < profiles.length; i++) {
                for (let j = i + 1; j < profiles.length; j++) {
                    const score = MatchService.calculateScore(profiles[i], profiles[j]);
                    output.push(`\nScore between User ${profiles[i].user} and User ${profiles[j].user}:`);
                    output.push(JSON.stringify(score, null, 2));
                }
            }
        }
        fs.writeFileSync('output.log', output.join('\n'));
        console.log("Wrote to output.log");
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('output.log', e.stack);
        console.error("Error", e);
        process.exit(1);
    }
}
testMatch();
