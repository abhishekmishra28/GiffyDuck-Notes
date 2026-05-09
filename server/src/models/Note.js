// models/Note.js

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    embedding: {
    type: [Number],
    default: []
}
}, {
    timestamps: true
});

// Index for performance
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);