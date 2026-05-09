const axios = require("axios");

exports.getEmbedding = async (text) => {
    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
            model: "models/text-embedding-004",
            content: {
                parts: [{ text }]
            }
        }
    );

    return response.data.embedding.values;
};