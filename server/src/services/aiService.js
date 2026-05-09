const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getEmbedding } = require("./embeddingService");
const Note = require("../models/Note");

// ✅ Lazy-init: Call AFTER dotenv.config() has run in server.js
function getGenAI() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    return new GoogleGenerativeAI(key);
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const getRelevantNotes = async (userId, query) => {
    // Try vector search first; fall back to plain text search if unavailable
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

    // Fallback: plain text/regex search with keywords
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

    // If still no matches (e.g. general query), just return the most recently updated notes
    if (notes.length === 0) {
        notes = await Note.find({ user: userId })
            .sort({ updatedAt: -1 })
            .limit(5);
    }

    return notes;
};

/**
 * Chat with notes — returns the AI answer string.
 * NOTE: Does NOT save messages to DB — the controller handles persistence.
 */
exports.chatWithNotes = async (userId, query, chatHistory = []) => {
    // 1. Get relevant notes
    const notes = await getRelevantNotes(userId, query);

    // 2. Format history
    const historyText = chatHistory
        .slice(-6)
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");

    // 3. Format notes context
    const context = notes.map((note, i) => `
NOTE ${i + 1}:
Title: ${note.title}
Content: ${note.content}
    `).join("\n");

    // 4. Build prompt
    const prompt = `
You are an AI assistant for a personal notes app.

${historyText ? `Conversation history:\n${historyText}\n` : ""}

${context ? `Relevant notes:\n${context}\n` : "The user has no notes matching this query.\n"}

User question:
${query}

Rules:
- Act as a friendly, conversational, and human-like assistant.
- Use markdown formatting extensively (bold text, bullet points, headers) to make your responses highly readable and systematically arranged.
- Keep paragraphs short and scannable.
- Answer based on the notes context when available.
- If the info is not in the notes, politely let the user know, but STILL try to answer their question using your general knowledge.
- Maintain conversation continuity with the history.
`;

    // 5. Generate response
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

/**
 * Streaming chat — calls onChunk for each text chunk.
 * Does NOT save messages — the controller handles persistence.
 */
exports.chatWithNotesStream = async (userId, query, chatHistory = [], onChunk) => {
    const notes = await getRelevantNotes(userId, query);

    const historyText = chatHistory
        .slice(-6)
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");

    const context = notes.map(n =>
        `Title: ${n.title}\nContent: ${n.content}`
    ).join("\n\n");

    const prompt = `
You are an AI assistant for a personal notes app.

${historyText ? `Conversation history:\n${historyText}\n` : ""}

${context ? `Relevant notes:\n${context}\n` : "The user has no notes matching this query.\n"}

User question:
${query}

Rules:
- Act as a friendly, conversational, and human-like assistant.
- Use markdown formatting extensively (bold text, bullet points, headers) to make your responses highly readable and systematically arranged.
- Keep paragraphs short and scannable.
- Answer based on the notes context when available.
- If the info is not in the notes, politely let the user know, but STILL try to answer their question using your general knowledge.
- Maintain conversation continuity with the history.
`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            onChunk(text);
        }
    }
};

/**
 * AI note suggestion (summarize / improve / expand / rewrite).
 */
exports.noteSuggestion = async ({ action, text, tone }) => {
    let instruction = "";

    switch (action) {
        case "summarize":
            instruction = "Summarize the following text clearly and concisely.";
            break;
        case "improve":
            instruction = "Improve the grammar, clarity, and readability of the text.";
            break;
        case "expand":
            instruction = "Expand the text with more explanation and examples.";
            break;
        case "rewrite":
            instruction = `Rewrite the text in a ${tone || "clear"} tone.`;
            break;
        default:
            throw new Error(`Invalid action: ${action}`);
    }

    const prompt = `
You are an AI writing assistant.

Task: ${instruction}

Text:
${text}

Rules:
- Keep the original meaning intact
- Be structured and well-formatted
- Do not add unrelated information
- Return only the improved text, no preamble
`;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

/**
 * Automatically generate a short, descriptive title for a chat
 */
exports.generateChatTitle = async (firstUserMessage) => {
    try {
        const prompt = `Generate a concise, 3-5 word title for a conversation that starts with this message. Do not use quotes, punctuation, or prefixes like "Title:". Be direct.
Message: "${firstUserMessage}"`;

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Title generation error:", error.message);
        // Fallback to truncating the message
        const words = firstUserMessage.split(" ");
        return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
    }
};