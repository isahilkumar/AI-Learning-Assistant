const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🚀 FAST START: Immediately listen on PORT to satisfy Render health checks
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is ACTIVE and listening on port ${PORT}`);
    console.log('🔄 Initializing background services...');
    
    // Connect to MongoDB in the background
    connectDB();
});

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// Serve uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('AI Learning Assistant API is running');
});

