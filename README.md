# AI Learning Assistant 🧠🤖

A powerful, AI-driven study platform designed to transform how students interact with their learning materials. This application uses Google Gemini AI to analyze documents (PDFs) and generate interactive study tools.

## 🚀 Features

- **📄 Smart PDF Viewer**: Integrated document viewer with AI tool integration.
- **✨ AI Summarization**: Generate concise, professional summaries of any document.
- **🗺️ Interactive Concept Map**: Visualize the underlying structure and relationships between ideas using Mermaid.js diagrams.
- **🗂️ Smart Flashcards**: Automatically extract key concepts as study cards.
- **🏆 Knowledge Quizzes**: Test your mastery with AI-generated MCQs and track your learning progress.
- **🧠 AI Chat Assistant**: Interrogate your documents directly. Ask questions, seek clarifications, and deep-dive into complex topics.
- **🏷️ Golden Sentence Highlights**: Automatically find the most critical sentences likely to appear on an exam.
- **🔍 Neural Search**: Semantic search across your entire document library.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Lucide React, Mermaid.js.
- **Backend**: Node.js, Express, MongoDB, Socket.io.
- **AI Engine**: Google Gemini API (with automatic model fallback).

## 📦 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/isahilkumar/AI-Learning-Assistant.git
   cd AI-Learning-Assistant
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   ```
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend/ai-learning-assistant
   npm install
   ```

4. **Run the application**:
   - Backend: `npm run dev` (from the Backend folder)
   - Frontend: `npm run dev` (from the frontend/ai-learning-assistant folder)

## 🤝 Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)
