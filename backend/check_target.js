const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const Match = require('./src/modules/matches/match.model');

async function fixDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        try {
            await Match.collection.dropIndex('users_1');
            console.log("Successfully dropped flawed index.");
        } catch (e) {
            console.log("Index might already be dropped or does not exist:", e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error("Fatal Error", e);
        process.exit(1);
    }
}
fixDB();
