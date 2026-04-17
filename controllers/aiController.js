const Document = require('../models/Document');
const QuizResult = require('../models/QuizResult');
const QuizResult = require('../models/QuizResult');
const { 
    generateSummary, 
    chatWithDocument, 
    generateFlashcards, 
    generateQuiz, 
    generateHighlights, 
    searchAllDocs, 
    generateConceptMap 
} = require('../utils/gemini');

// Summarize Document
const summarizeDoc = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { lang } = req.query;
        const summary = await generateSummary(doc.textContent, lang || 'Auto');
        res.json({ summary });
    } catch (error) {
        console.error("Summarize Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. Please try again in a few minutes or use a different API key.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Chat with Document
const chatDoc = async (req, res) => {
    try {
        const { question, history, lang } = req.body;
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const answer = await chatWithDocument(doc.textContent, question, history || [], lang || 'Auto');
        res.json({ answer });
    } catch (error) {
        console.error("Chat Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota. Please try again later.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Generate Flashcards
const flashcardsDoc = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { lang } = req.query;
        const flashcards = await generateFlashcards(doc.textContent, lang || 'Auto');
        res.json({ flashcards });
    } catch (error) {
        console.error("Flashcards Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Generate Quiz
const quizDoc = async (req, res) => {
    try {
        const { count, lang } = req.query;
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const quiz = await generateQuiz(doc.textContent, count || 5, lang || 'Auto');
        res.json({ quiz });
    } catch (error) {
        console.error("Quiz Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Save Quiz Result
const saveQuizResult = async (req, res) => {
    try {
        const { docId, score, totalQuestions } = req.body;
        const newResult = new QuizResult({
            userId: req.user.id,
            docId,
            score,
            totalQuestions
        });
        await newResult.save();
        res.status(201).json(newResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Global Learning Stats
const getLearningStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const results = await QuizResult.find({ userId });
        
        if (results.length === 0) {
            return res.json({
                averageScore: 0,
                totalQuizzes: 0,
                totalQuestions: 0,
                mastery: 0
            });
        }

        const totalQuizzes = results.length;
        const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0);
        const totalCorrect = results.reduce((acc, r) => acc + r.score, 0);
        const averageScore = (totalCorrect / totalQuestions) * 100;

        res.json({
            averageScore: Math.round(averageScore),
            totalQuizzes,
            totalQuestions,
            mastery: Math.round(averageScore) // Simplified mastery metric
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate Highlights
const highlightsDoc = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { lang } = req.query;
        const highlights = await generateHighlights(doc.textContent, lang || 'Auto');
        res.json({ highlights });
    } catch (error) {
        console.error("Highlights Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Cross-Document Neural Search
const searchDocs = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: 'Question is required' });
        const documents = await Document.find({ userId: req.user.id });
        if (documents.length === 0) return res.status(404).json({ message: 'No documents found. Upload some documents first.' });
        const answer = await searchAllDocs(documents, question);
        res.json({ answer, docCount: documents.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate Concept Map
const conceptMapDoc = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const { lang } = req.query;
        const conceptMap = await generateConceptMap(doc.textContent, lang || 'Auto');
        res.json({ conceptMap });
    } catch (error) {
        console.error("Concept Map Error:", error);
        if (error.message?.includes('429') || error.message?.includes('Quota')) {
            return res.status(429).json({ message: 'AI limit reached. All available models have reached their quota.' });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    summarizeDoc,
    chatDoc,
    flashcardsDoc,
    quizDoc,
    highlightsDoc,
    searchDocs,
    saveQuizResult,
    getLearningStats,
    conceptMapDoc
};
