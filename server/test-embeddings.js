require('dotenv').config();
const mongoose = require('mongoose');
const { getEmbedding } = require('./src/services/embeddingService');
const Note = require('./src/models/Note');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const queryEmbedding = await getEmbedding("React");
        console.log("Generated embedding length:", queryEmbedding.length);
        console.log("First few values:", queryEmbedding.slice(0, 5));

        const notes = await Note.find();
        if (notes.length > 0) {
            console.log("First note embedding length:", notes[0].embedding?.length);
            console.log("First note embedding first few values:", notes[0].embedding?.slice(0, 5));
        }
    } catch (err) {
        console.error("Error:", err);
    }
    
    process.exit(0);
}
run().catch(console.error);
