require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Note = require('./src/models/Note');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find();
    console.log("Total users:", users.length);
    const notes = await Note.find();
    console.log("Total notes:", notes.length);
    if (notes.length > 0) {
        console.log("Note users:", notes.map(n => n.user));
        console.log("First user id:", users[0]._id);
    }
    process.exit(0);
}
run().catch(console.error);
