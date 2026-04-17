const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { 
    summarizeDoc, 
    chatDoc, 
    flashcardsDoc, 
    quizDoc, 
    highlightsDoc, 
    searchDocs, 
    saveQuizResult, 
    getLearningStats,
    conceptMapDoc
} = require('../controllers/aiController');

router.get('/summary/:id', auth, summarizeDoc);
router.post('/chat/:id', auth, chatDoc);
router.get('/flashcards/:id', auth, flashcardsDoc);
router.get('/quiz/:id', auth, quizDoc);
router.get('/highlights/:id', auth, highlightsDoc);
router.post('/search', auth, searchDocs);
router.get('/concept-map/:id', auth, conceptMapDoc);

// Progress Tracking
router.post('/progress', auth, saveQuizResult);
router.get('/progress', auth, getLearningStats);

module.exports = router;
