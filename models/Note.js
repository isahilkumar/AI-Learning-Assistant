const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    content: { type: String, default: '' },
    aiFeedback: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
