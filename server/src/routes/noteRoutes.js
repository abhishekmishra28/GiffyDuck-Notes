// routes/noteRoutes.js

const express = require("express");
const router = express.Router();

const {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    getNoteStats,
    getNoteTags
} = require("../controllers/noteController");

const { protect } = require("../middlewares/authMiddleware");

// Create + Get All Notes
router.route('/')
    .post(protect, createNote)
    .get(protect, getNotes);

// Stats + Tags
router.get('/stats', protect, getNoteStats);
router.get('/tags', protect, getNoteTags);

// Get Single Note + Update + Delete
router.route('/:id')
    .get(protect, getNote)
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;