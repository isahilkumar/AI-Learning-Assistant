const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testing gemini-flash-latest model...");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hi AI Assistant, are you ready to help?");
        console.log("Success! AI Response:", result.response.text());
    } catch (error) {
        console.error("Gemini API Test Failed:", error.message);
    }
}

test();
