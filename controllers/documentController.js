const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// Upload Document
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        // Parse PDF from Cloudinary URL
        const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
        const data = await pdfParse(response.data);

        const newDocument = new Document({
            userId: req.user.id,
            title: req.body.title || req.file.originalname,
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            publicId: req.file.filename, // cloudinary property
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

        // Delete file from Cloudinary
        if (document.publicId) {
            await cloudinary.uploader.destroy(document.publicId, { resource_type: 'raw' });
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
