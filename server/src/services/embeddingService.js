const axios = require("axios");

/**
 * Get a vector embedding for the given text using Gemini Embedding API.
 * Falls back gracefully — callers should handle empty array responses.
 */
exports.getEmbedding = async (text) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    // Use the currently available embedding model
    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
        {
            model: "models/gemini-embedding-001",
            content: {
                parts: [{ text }]
            }
        }
    );

    return response.data.embedding.values;
};