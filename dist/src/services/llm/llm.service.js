"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const gemini_provider_1 = require("./gemini.provider");
const message_repository_1 = require("../../repositories/message.repository");
const client_1 = require("@prisma/client");
class LLMService {
    provider;
    messageRepository;
    constructor(provider, messageRepository) {
        // Default to GeminiProvider if none provided, allowing dependency injection
        this.provider = provider || new gemini_provider_1.GeminiProvider();
        this.messageRepository = messageRepository || new message_repository_1.MessageRepository();
    }
    async generateReply(conversationId, newUserMessage) {
        try {
            // 1. Fetch recent conversation history (last 10 messages)
            const recentMessages = await this.messageRepository.findRecentByConversationId(conversationId, 10);
            // 2. Convert into standard LLMMessage format
            const history = recentMessages.map((msg) => ({
                role: msg.sender === client_1.SenderType.USER ? 'user' : 'assistant',
                content: msg.content,
            }));
            // Ensure the latest user message is present at the end of the history array
            const lastMessage = history[history.length - 1];
            if (!lastMessage || lastMessage.content !== newUserMessage || lastMessage.role !== 'user') {
                history.push({ role: 'user', content: newUserMessage });
            }
            // 3. Define the SpurMart Ecommerce Support System Prompt
            const systemInstruction = `You are a helpful customer support representative for SpurMart.

You answer clearly, professionally, and concisely.

Store Information:

Shipping Policy:
* Domestic shipping: 3-5 business days
* International shipping: 7-14 business days

Return Policy:
* Returns accepted within 30 days
* Product must be unused
* Refunds processed in 5-7 business days

Support Hours:
* Monday-Friday
* 9AM-6PM UTC

Always answer based on the information above.

If information is unavailable:
Politely say you don't know.

Never hallucinate policies.`;
            // 4. Invoke LLM with retry mechanics (3 attempts, 1000ms initial backoff)
            const reply = await this.callLLMWithRetry(history, systemInstruction, 3, 1000);
            return reply;
        }
        catch (error) {
            // Log the exact error internally
            console.error('[LLMService Exception] failed to generate reply:', error);
            // Return the required user-safe fallback reply
            return "I'm currently experiencing technical difficulties. Please try again shortly.";
        }
    }
    async callLLMWithRetry(messages, systemInstruction, retries, delay) {
        try {
            return await this.provider.generateReply(messages, systemInstruction);
        }
        catch (error) {
            if (retries <= 1) {
                throw error; // Propagate error on final failure
            }
            console.warn(`[LLM Service Retry] provider failed. Retrying in ${delay}ms... (${retries - 1} attempts remaining). Error:`, error);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.callLLMWithRetry(messages, systemInstruction, retries - 1, delay * 2);
        }
    }
}
exports.LLMService = LLMService;
