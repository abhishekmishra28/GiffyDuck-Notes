const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { getEmbedding } = require("./embeddingService");
const Note = require("../models/Note");
const Chat = require("../models/Chat");

const getRelevantNotes = async (userId, query) => {
    const queryEmbedding = await getEmbedding(query);

    const notes = await Note.aggregate([
        {
            $vectorSearch: {
                index: "vector_index", // create in Atlas
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 5,
                filter: {
                    user: userId
                }
            }
        }
    ]);

    return notes;
};

exports.chatWithNotes = async (userId, query) => {
    try {
        //  1. Get relevant notes (your vector search)
        const notes = await getRelevantNotes(userId, query);

        //  2. Get chat history
        let chat = await Chat.findOne({ user: userId });

        let history = [];
        if (chat) {
            history = chat.messages.slice(-6); // last 6 messages
        }

        //  3. Format history
        const historyText = history.map(m =>
            `${m.role}: ${m.content}`
        ).join("\n");

        //  4. Format notes
        const context = notes.map((note, i) => `
        NOTE ${i + 1}:
        ${note.title}
        ${note.content}
        `).join("\n");

        //  5. Prompt
        const prompt = `
            You are an AI assistant.

            Conversation history:
            ${historyText}

            Context (user notes):
            ${context}

            User question:
            ${query}

            Rules:
            - Use context
            - Maintain conversation continuity
            - If not found, say "Not in notes"
            `;

        //  6. Gemini call (same as before)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        //  7. Save conversation
        if (!chat) {
            chat = await Chat.create({
                user: userId,
                messages: []
            });
        }

        chat.messages.push(
            { role: "user", content: query },
            { role: "assistant", content: answer }
        );

        // Limit history size
        if (chat.messages.length > 20) {
            chat.messages = chat.messages.slice(-20);
        }

        await chat.save();

        return answer;

    } catch (error) {
        console.error("Chat error:", error);
        return "Error generating response";
    }
};

exports.chatWithNotesStream = async (userId, query, onChunk) => {
    const notes = await getRelevantNotes(userId, query);

    const context = notes.map(n =>
        `Title: ${n.title}\nContent: ${n.content}`
    ).join("\n\n");

    const prompt = `
You are an AI assistant.

Context:
${context}

User:
${query}
`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash"
    });

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            onChunk(text);
        }
    }
};

exports.noteSuggestion = async ({ action, text, tone }) => {

    let instruction = "";

    switch (action) {
        case "summarize":
            instruction = "Summarize the following text clearly and concisely.";
            break;

        case "improve":
            instruction = "Improve grammar, clarity, and readability of the text.";
            break;

        case "expand":
            instruction = "Expand the text with more explanation and examples.";
            break;

        case "rewrite":
            instruction = `Rewrite the text in a ${tone || "clear"} tone.`;
            break;

        default:
            throw new Error("Invalid action");
    }

    const prompt = `
You are an AI writing assistant.

Task: ${instruction}

Text:
${text}

Rules:
- Keep meaning intact
- Be structured
- Do not add unrelated info
`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
};