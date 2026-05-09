require('dotenv').config();
const mongoose = require('mongoose');
const aiService = require('./src/services/aiService');
const User = require('./src/models/User');
const Note = require('./src/models/Note');

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
                    filter: { user: userId }
                }
            }
        ]);
        if (notes.length > 0) return notes;
    } catch (err) {
        console.warn("Vector search failed, falling back to text search:", err.message);
    }
    
    // Fallback: keywords search
    const keywords = query.split(/\s+/).filter(w => w.length > 3).map(w => escapeRegex(w));
    let notes = [];
    if (keywords.length > 0) {
        const regexStr = keywords.join('|');
        notes = await Note.find({
            user: userId,
            $or: [
                { title: { $regex: regexStr, $options: "i" } },
                { content: { $regex: regexStr, $options: "i" } }
            ]
        }).sort({ updatedAt: -1 }).limit(5);
    }

    // If still no notes, just return 5 most recent
    if (notes.length === 0) {
        notes = await Note.find({ user: userId }).sort({ updatedAt: -1 }).limit(5);
    }

    return notes;
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const userId = new mongoose.Types.ObjectId('69e12f1682570065251a3a65');
    
    console.log("Testing query: 'Tell me about my notes'");
    let notes = await getRelevantNotes(userId, "Tell me about my notes");
    console.log("Notes found:", notes.length);
    if (notes.length > 0) console.log("Titles:", notes.map(n => n.title));
    
    process.exit(0);
}
run().catch(console.error);
