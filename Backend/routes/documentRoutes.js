const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middlewares/auth');
const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    renameDocument
} = require('../controllers/documentController');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ai_learning_assistant',
        allowed_formats: ['pdf'],
        resource_type: 'raw' // Important for non-image files like PDF
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', auth, upload.single('pdf'), uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocumentById);
router.delete('/:id', auth, deleteDocument);
router.put('/:id', auth, renameDocument);

module.exports = router;
