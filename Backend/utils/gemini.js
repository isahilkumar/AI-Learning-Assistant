const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List of fallback models to try if the primary one fails with a quota error
// Including a wider range of models with separate quota pools
const FALLBACK_MODELS = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];

/**
 * Helper to call Gemini with automatic model fallback for quota errors
 */
const safeGenerate = async (prompt, isJson = false) => {
    let lastError;
    
    for (const modelName of FALLBACK_MODELS) {
        try {
            console.log(`[AI] Attempting generation with: ${modelName}`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: isJson ? { responseMimeType: "application/json" } : {}
            });
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            
            // Cleanup markdown if AI ignored the JSON-only instruction
            if (isJson) {
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            }
            
            return text;
        } catch (error) {
            lastError = error;
            const errorText = (JSON.stringify(error) + (error.message || "")).toLowerCase();
            const isQuotaError = errorText.includes('429') || errorText.includes('quota');
            const isNotFoundError = errorText.includes('404') || errorText.includes('not found');
            
            console.warn(`[AI] Error with ${modelName}:`, error.message || "Unknown error");
            
            if (isQuotaError || isNotFoundError) {
                console.warn(`[AI] Model ${modelName} unavailable (Quota/404). Trying next...`);
                continue; 
            }
            throw error;
        }
    }
    
    throw lastError; 
};

// Helper to ensure we always get an array of objects even if Gemini wraps it
const extractArray = (data, key) => {
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (Array.isArray(parsed)) return parsed;
        if (parsed[key] && Array.isArray(parsed[key])) return parsed[key];
        // Find any array property if the key doesn't match
        const firstArray = Object.values(parsed).find(v => Array.isArray(v));
        return firstArray || [];
    } catch (e) {
        console.error("JSON Extraction Error:", e);
        return [];
    }
};

const generateSummary = async (text, language = 'Auto') => {
    const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
    const prompt = `Summarize the following document content in a clear, concise way using bullet points. Focus on the key concepts and main ideas. 
    IMPORTANT: Your entire response must be in ${langInstruction}.
    
    Content: ${text.substring(0, 30000)}`;
    
    return await safeGenerate(prompt);
};

const chatWithDocument = async (text, question, history, language = 'Auto') => {
    try {
        const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
        const contextPrompt = `You are an AI Learning Assistant. Here is the content of a document I am studying: ${text.substring(0, 20000)}. Please answer any questions based on this content. Your response MUST be in ${langInstruction}.`;
        
        const fullPrompt = `${contextPrompt}\n\nChat History:\n${history.map(m => `${m.role}: ${m.text}`).join('\n')}\n\nUser Question: ${question}`;
        
        return await safeGenerate(fullPrompt);
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error;
    }
};

const generateFlashcards = async (text, language = 'Auto') => {
    const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
    const prompt = `Generate 5 key concepts from the following text as flashcards. Return ONLY a JSON array of objects, where each object has "front" (the term or question) and "back" (the definition or answer). 
    IMPORTANT: The content of the flashcards must be in ${langInstruction}.
    
    Content: ${text.substring(0, 20000)}`;
    
    const response = await safeGenerate(prompt, true);
    return extractArray(response, 'flashcards');
};

const generateQuiz = async (text, count = 5, language = 'Auto') => {
    const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
    const prompt = `Generate ${count} multiple choice questions from the following text. Return ONLY a JSON array of objects. Each object must have:
    "question": the question text,
    "options": an array of 4 strings,
    "correctAnswer": the index (0-3) of the correct option,
    "explanation": a brief explanation of why that answer is correct.
    
    IMPORTANT: All text in the JSON (questions, options, explanations) must be in ${langInstruction}.
    
    \n\nContent: ${text.substring(0, 20000)}`;
    
    const response = await safeGenerate(prompt, true);
    return extractArray(response, 'quiz');
};

const generateHighlights = async (text, language = 'Auto') => {
    const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
    const prompt = `Identify the 6-8 most critical "Golden Sentences" from the following text that are highly likely to be on an exam. Return ONLY a JSON array of objects. Each object must have:
    "text": the exact sentence from the document,
    "rationale": why this is important for an exam,
    "priority": "Critical" or "High".
    
    IMPORTANT: The "rationale" and "priority" must be in ${langInstruction}. The "text" should remain in its original language.
    
    \n\nContent: ${text.substring(0, 20000)}`;
    
    const response = await safeGenerate(prompt, true);
    return extractArray(response, 'highlights');
};

const searchAllDocs = async (documents, question) => {
    const docContext = documents.map((d, i) =>
        `--- Document ${i + 1}: "${d.title}" ---\n${d.textContent.substring(0, 8000)}`
    ).join('\n\n');
    const prompt = `Based on the following documents, answer the question: "${question}"\n\nDocuments:\n${docContext}`;
    
    return await safeGenerate(prompt);
};

const analyzeNotes = async (docText, notes) => {
    const prompt = `A student is studying a document and has written personal notes. Analyze their notes against the source document and provide:\n1. What they understood correctly\n2. Key concepts they missed or got wrong\n3. 2-3 personalized study tips based on their notes\n\nDocument Content (excerpt): ${docText.substring(0, 10000)}\n\nStudent Notes: ${notes}\n\nKeep your feedback encouraging, specific, and under 300 words.`;
    return await safeGenerate(prompt);
};

const generateConceptMap = async (text, language = 'Auto') => {
    const langInstruction = language === 'Auto' ? 'the same language as the document' : language;
    const prompt = `Analyze the following technical/educational text and extract a concept map (mind map). 
    Identify the main central concept and its relationship with sub-concepts, definitions, and related ideas.
    
    Return ONLY a JSON object with two arrays:
    1. "nodes": an array of objects with { "id": "unique_id", "label": "Concept Name" }
    2. "edges": an array of objects with { "from": "id1", "to": "id2", "label": "relationship type (optional)" }
    
    Limit to 10-15 most important nodes for clarity.
    IMPORTANT: All labels and relationship types must be in ${langInstruction}.
    
    \n\nContent: ${text.substring(0, 20000)}`;
    
    const response = await safeGenerate(prompt, true);
    try {
        const parsed = JSON.parse(response);
        return parsed;
    } catch (e) {
        console.error("Concept Map JSON Error:", e);
        return { nodes: [], edges: [] };
    }
};

module.exports = {
    generateSummary,
    chatWithDocument,
    generateFlashcards,
    generateQuiz,
    generateHighlights,
    searchAllDocs,
    analyzeNotes,
    generateConceptMap
};
