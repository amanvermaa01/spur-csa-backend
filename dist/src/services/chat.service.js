"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const conversation_repository_1 = require("../repositories/conversation.repository");
const message_repository_1 = require("../repositories/message.repository");
const llm_service_1 = require("./llm/llm.service");
const client_1 = require("@prisma/client");
class ChatService {
    conversationRepository;
    messageRepository;
    llmService;
    constructor(conversationRepository, messageRepository, llmService) {
        this.conversationRepository = conversationRepository || new conversation_repository_1.ConversationRepository();
        this.messageRepository = messageRepository || new message_repository_1.MessageRepository();
        this.llmService = llmService || new llm_service_1.LLMService();
    }
    /**
     * Processes an incoming message from a user, updates the database logs,
     * calls the LLM with appropriate context history, and logs the response.
     */
    async handleUserMessage(message, sessionId) {
        let conversationId = sessionId;
        let conversationExists = false;
        if (conversationId) {
            conversationExists = await this.conversationRepository.exists(conversationId);
        }
        // Create a new session if none exists or the provided session is invalid
        if (!conversationId || !conversationExists) {
            const conversation = await this.conversationRepository.create();
            conversationId = conversation.id;
        }
        // 1. Log and persist the User's Message
        await this.messageRepository.create(conversationId, client_1.SenderType.USER, message);
        // 2. Query LLM to generate the AI Reply with conversation context
        const reply = await this.llmService.generateReply(conversationId, message);
        // 3. Log and persist the AI's Message
        await this.messageRepository.create(conversationId, client_1.SenderType.AI, reply);
        return {
            reply,
            sessionId: conversationId,
        };
    }
}
exports.ChatService = ChatService;
