const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getUserStats } = require('../controllers/userController');

router.get('/stats', auth, getUserStats);

module.exports = router;
