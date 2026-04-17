const Document = require('../models/Document');

// Get User Analytics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalDocs = await Document.countDocuments({ userId });
        const allDocs = await Document.find({ userId }).select('fileSize uploadDate title');
        
        const totalSize = allDocs.reduce((acc, doc) => acc + doc.fileSize, 0);
        
        // Latest Activity (last 5 uploads)
        const recentActivity = allDocs
            .sort((a, b) => b.uploadDate - a.uploadDate)
            .slice(0, 5)
            .map(doc => ({
                type: 'upload',
                title: doc.title,
                date: doc.uploadDate,
                id: doc._id
            }));

        res.json({
            stats: {
                totalDocs,
                totalSize,
            },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserStats
};
