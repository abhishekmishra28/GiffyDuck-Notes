require('dotenv').config();
const mongoose = require('mongoose');
const aiService = require('./src/services/aiService');
const User = require('./src/models/User');
const Note = require('./src/models/Note');

// Mock getRelevantNotes to expose it since it's not exported
async function getRelevantNotes(userId, query) {
    const { getEmbedding } = require('./src/services/embeddingService');
    function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    try {
        const queryEmbedding = await getEmbedding(query);
        const notes = await Note.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 5,
                    // REMOVED FILTER to test if index is working at all
                }
            }
        ]);
        console.log("Vector search results WITHOUT filter count:", notes.length);
        if (notes.length > 0) return notes;
    } catch (err) {
        console.warn("Vector search failed:", err.message);
    }
    
    return [];
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId('69e12f1682570065251a3a65');
    
    console.log("Testing query: 'React'");
    let notes = await getRelevantNotes(userId, "React");
    console.log("Notes found without filter:", notes.length);
    
    process.exit(0);
}
run().catch(console.error);
