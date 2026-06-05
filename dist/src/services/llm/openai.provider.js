"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
class OpenAIProvider {
    constructor() {
        // OpenAI client initialization would go here in actual implementation
    }
    async generateReply(messages, systemInstruction) {
        throw new Error('OpenAIProvider is not active. Use GeminiProvider instead.');
    }
}
exports.OpenAIProvider = OpenAIProvider;
