// controllers/noteController.js

const Note = require("../models/Note");
const { getEmbedding } = require("../services/embeddingService");

exports.createNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        //  1. Validate FIRST
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and Content are required."
            });
        }

        //  2. Prepare text (limit size for cost control)
        const text = `${title} ${content}`.slice(0, 2000);

        let embedding = [];

        //  3. Try embedding (don’t break if it fails)
        try {
            embedding = await getEmbedding(text);
        } catch (err) {
            console.error("Embedding failed:", err.message);
        }

        //  4. Create note ONCE
        const note = await Note.create({
            user: req.user._id,
            title,
            content,
            tags,
            embedding
        });

        res.status(201).json({
            success: true,
            note
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getNotes = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search,
            tag,
            isPinned,
            isArchived,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 50);

        const query = { user: req.user._id };

        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        // 🏷️ Tag filter
        if (tag) {
            query.tags = tag;
        }

        // 📌 Pinned
        if (isPinned !== undefined) {
            query.isPinned = isPinned === "true";
        }

        // 🗂️ Archived
        if (isArchived !== undefined) {
            query.isArchived = isArchived === "true";
        }

        const skip = (pageNum - 1) * limitNum;
        const sortOrder = order === "asc" ? 1 : -1;

        const notes = await Note.find(query)
            .sort({ isPinned: -1, [sortBy]: sortOrder })
            .skip(skip)
            .limit(limitNum);

        const total = await Note.countDocuments(query);

        res.status(200).json({
            success: true,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            total,
            count: notes.length,
            notes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getNote = async (req,res) => {
    try {
        const note = await Note.findOne({
            _id : req.params.id,
            user : req.user._id
        });
        if(!note){
            return res.status(404).json({
                success : false,
                message : "Note Not Found."
            });
        }
        res.status(200).json({
            success : true,
            note
        });
    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

exports.updateNote = async (req,res) => {
    try {
        const { title, content, tags, isPinned, isArchived } = req.body;
        const note = await Note.findOne({
            _id : req.params.id,
            user : req.user._id
        });
        if(!note) {
            return res.status(404).json({
                success : false,
                message : "Note not Found."
            });
        }
        if(title        != undefined) note.title        = title;
        if(content      != undefined) note.content      = content;
        if(tags         != undefined) note.tags         = tags;
        if(isPinned     != undefined) note.isPinned     = isPinned;
        if(isArchived   != undefined) note.isArchived   = isArchived;

        await note.save();

        res.status(200).json({
            success : true,
            note
        });
    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

exports.deleteNote = async(req,res) => {
    try {
        const note = await Note.findOne({
            _id : req.params.id,
            user : req.user._id
        });
        if(!note) {
            return res.status(404).json({
                success : false,
                message : "Note Not Found."
            });
        }
        await note.deleteOne();
        res.status(201).json({
            success : true,
            message : "Note Deleted Successfully."
        });
    }catch (error) {
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

exports.getNoteStats = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        const totalNotes = notes.length;
        const totalWords = notes.reduce((acc, note) => {
            const text = (note.content || '').replace(/<[^>]+>/g, ' ');
            return acc + text.trim().split(/\s+/).filter(Boolean).length;
        }, 0);
        const tagsSet = new Set();
        notes.forEach(n => n.tags?.forEach(t => tagsSet.add(t)));
        const lastActivity = notes.length > 0
            ? notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt
            : null;

        res.status(200).json({
            success: true,
            stats: {
                totalNotes,
                totalWords,
                uniqueTagsCount: tagsSet.size,
                lastActivity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getNoteTags = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        const tagsSet = new Set();
        notes.forEach(n => n.tags?.forEach(t => tagsSet.add(t)));
        res.status(200).json({
            success: true,
            tags: Array.from(tagsSet)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};