require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

async function testGemini() {
    try {
        console.log("Testing Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Say hello in one sentence."
        });

        console.log("SUCCESS:");
        console.log(response.text);

    } catch (error) {
        console.log("FAILED:");
        console.log("message:", error?.message);
        console.log("status:", error?.status);
        console.log("code:", error?.code);
    }
}

testGemini();