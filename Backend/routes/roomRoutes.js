const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { createRoom, joinRoom, closeRoom } = require('../controllers/roomController');

router.post('/create', auth, createRoom);
router.get('/join/:roomCode', auth, joinRoom);
router.put('/close/:id', auth, closeRoom);

module.exports = router;
