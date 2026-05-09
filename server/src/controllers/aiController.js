const aiService = require("../services/aiService");
const User = require("../models/User");
const Chat = require("../models/Chat");
const Note = require("../models/Note");

exports.chat = async (req, res) => {
    try {
        const { query, chatId } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Query is required"
            });
        }

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "chatId is required"
            });
        }

        if (query.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Query too long"
            });
        }

        if (req.user.aiUsageCount >= req.user.aiQuota) {
            return res.status(403).json({
                success: false,
                message: "AI quota exceeded"
            });
        }

        //  Find chat thread
        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const response = await aiService.chatWithNotes(
            req.user._id,
            query
        );

        //  Save messages
        chat.messages.push(
            { role: "user", content: query },
            { role: "assistant", content: response }
        );

        if (chat.messages.length > 30) {
            chat.messages = chat.messages.slice(-30);
        }

        await chat.save();

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { aiUsageCount: 1 }
        });

        res.status(200).json({
            success: true,
            response
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ user: req.user._id });

        res.status(200).json({
            success: true,
            messages: chat?.messages || []
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.chatStream = async (req, res) => {
    try {
        const { query, chatId } = req.body;

        if (!query || !chatId) {
            return res.status(400).json({
                success: false,
                message: "Query and chatId are required"
            });
        }

        if (query.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Query too long"
            });
        }

        if (req.user.aiUsageCount >= req.user.aiQuota) {
            return res.status(403).json({
                success: false,
                message: "AI quota exceeded"
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        //  SSE setup
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.flushHeaders?.();

        let fullResponse = "";

        req.on("close", () => {
            console.log("Client disconnected");
        });

        await aiService.chatWithNotesStream(
            req.user._id,
            query,
            (chunk) => {
                fullResponse += chunk;

                const safeChunk = chunk.replace(/\n/g, "\\n");
                res.write(`data: ${safeChunk}\n\n`);
            }
        );

        res.write("data: [DONE]\n\n");
        res.end();

        //  Save chat
        chat.messages.push(
            { role: "user", content: query },
            { role: "assistant", content: fullResponse }
        );

        if (chat.messages.length > 30) {
            chat.messages = chat.messages.slice(-30);
        }

        await chat.save();

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { aiUsageCount: 1 }
        });

    } catch (error) {
        console.error(error);
        res.end();
    }
};

exports.createChat = async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user._id,
            messages: []
        });

        res.status(201).json({
            success: true,
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user._id })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            chats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            user: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        res.json({
            success: true,
            messages: chat.messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.suggestForNote = async (req, res) => {
    try {
        const { noteId, action, text, tone } = req.body;

        if (!noteId || !action) {
            return res.status(400).json({
                success: false,
                message: "noteId and action are required"
            });
        }

        if (req.user.aiUsageCount >= req.user.aiQuota) {
            return res.status(403).json({
                success: false,
                message: "AI quota exceeded"
            });
        }

        //  fetch note (ownership check)
        const note = await Note.findOne({
            _id: noteId,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        //  use selected text OR full content
        const inputText = text || note.content;

        const result = await aiService.noteSuggestion({
            action,
            text: inputText,
            tone
        });

        //  update quota
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { aiUsageCount: 1 }
        });

        res.status(200).json({
            success: true,
            suggestion: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};