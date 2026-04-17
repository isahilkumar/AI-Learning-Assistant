const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Upload Document
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        const newDocument = new Document({
            userId: req.user.id,
            title: req.body.title || req.file.originalname,
            fileName: req.file.filename,
            fileSize: req.file.size,
            textContent: data.text
        });

        await newDocument.save();

        res.status(201).json(newDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Documents for User
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.id }).sort({ uploadDate: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Document Detail
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Document
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from uploads
        const filePath = path.join(__dirname, '../uploads', document.fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Document.deleteOne({ _id: req.params.id });
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rename Document
const renameDocument = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title: title.trim() },
            { new: true }
        );
        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    renameDocument
};
