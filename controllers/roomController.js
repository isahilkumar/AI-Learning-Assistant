const Room = require('../models/Room');
const Document = require('../models/Document');

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Create a room
const createRoom = async (req, res) => {
    try {
        const { docId } = req.body;
        const doc = await Document.findOne({ _id: docId, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        let roomCode = generateRoomCode();
        // Ensure unique
        while (await Room.findOne({ roomCode })) roomCode = generateRoomCode();

        const room = new Room({
            roomCode,
            hostId: req.user.id,
            docId,
            docTitle: doc.title,
            members: [req.user.id]
        });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Join a room by code
const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase(), isActive: true })
            .populate('docId', 'title fileName');
        if (!room) return res.status(404).json({ message: 'Room not found or has ended' });

        if (!room.members.includes(req.user.id)) {
            room.members.push(req.user.id);
            await room.save();
        }
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Close a room
const closeRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ _id: req.params.id, hostId: req.user.id });
        if (!room) return res.status(404).json({ message: 'Room not found' });
        room.isActive = false;
        await room.save();
        res.json({ message: 'Room closed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createRoom, joinRoom, closeRoom };
