const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getNotes, saveNotes, analyzeDocNotes } = require('../controllers/noteController');

router.get('/:docId', auth, getNotes);
router.put('/:docId', auth, saveNotes);
router.post('/analyze/:docId', auth, analyzeDocNotes);

module.exports = router;
