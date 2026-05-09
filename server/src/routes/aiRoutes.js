const express = require("express");
const router = express.Router();

const {
    chat,
    chatStream,
    getChatHistory,
    createChat,
    getChats,
    getChatById,
    suggestForNote
} = require("../controllers/aiController");

const { protect } = require("../middlewares/authMiddleware");
const { isVerified } = require("../middlewares/verifiedMiddleware");
const { chatLimiter } = require("../middlewares/rateLimiter");

//  COMMON MIDDLEWARE STACK
const secure = [protect, isVerified, chatLimiter];

//  CHAT (NON-STREAM)
router.post("/message", ...secure, chat);
//  STREAMING CHAT
router.post("/message/stream", ...secure, chatStream);
//  CHAT HISTORY (legacy / single chat)
router.get("/history", protect, getChatHistory);
//  MULTI-CHAT THREADS
router.post("/chats", protect, createChat);
router.get("/chats", protect, getChats);
router.get("/chats/:chatId", protect, getChatById);
router.post(
    "/note/suggest",
    protect,
    isVerified,
    chatLimiter,
    suggestForNote
);


module.exports = router;