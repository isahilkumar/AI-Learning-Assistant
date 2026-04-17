const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true, uppercase: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    docTitle: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    chat: [{
        senderName: String,
        message: String,
        type: { type: String, enum: ['user', 'ai', 'system'], default: 'user' },
        timestamp: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
