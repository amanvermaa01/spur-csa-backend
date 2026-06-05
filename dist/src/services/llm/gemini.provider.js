"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiProvider {
    genAI;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is not defined');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async generateReply(messages, systemInstruction) {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemInstruction,
        });
        // Map roles: 'user' -> 'user', 'assistant' -> 'model'
        // Filter out 'system' messages because they are configured via systemInstruction
        const contents = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const result = await model.generateContent({
            contents,
        });
        const response = result.response;
        const text = response.text();
        if (!text) {
            throw new Error('Gemini API returned an empty response');
        }
        return text;
    }
}
exports.GeminiProvider = GeminiProvider;
