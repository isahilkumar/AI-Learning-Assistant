const Note = require('../models/Note');
const { analyzeNotes } = require('../utils/gemini');
const Document = require('../models/Document');

// Get notes for a document
const getNotes = async (req, res) => {
    try {
        const note = await Note.findOne({ userId: req.user.id, docId: req.params.docId });
        res.json(note || { content: '', aiFeedback: '' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Save notes for a document (upsert)
const saveNotes = async (req, res) => {
    try {
        const { content } = req.body;
        const note = await Note.findOneAndUpdate(
            { userId: req.user.id, docId: req.params.docId },
            { content, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// AI analyze notes against document
const analyzeDocNotes = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { notes } = req.body;
        const feedback = await analyzeNotes(doc.textContent, notes);

        // Store in DB
        await Note.findOneAndUpdate(
            { userId: req.user.id, docId: req.params.docId },
            { content: notes, aiFeedback: feedback, updatedAt: Date.now() },
            { upsert: true }
        );

        res.json({ feedback });
    } catch (err) {
        console.error("Analyze Notes Error:", err);
        if (err.message?.includes('429') || err.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota.' });
        }
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getNotes, saveNotes, analyzeDocNotes };
