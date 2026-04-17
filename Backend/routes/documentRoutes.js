const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middlewares/auth');
const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    renameDocument
} = require('../controllers/documentController');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', auth, upload.single('pdf'), uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocumentById);
router.delete('/:id', auth, deleteDocument);
router.put('/:id', auth, renameDocument);

module.exports = router;
