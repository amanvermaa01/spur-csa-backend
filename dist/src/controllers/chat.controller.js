"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const conversation_repository_1 = require("../repositories/conversation.repository");
const chat_service_1 = require("../services/chat.service");
class ChatController {
    conversationRepository;
    chatService;
    constructor(conversationRepository, chatService) {
        this.conversationRepository = conversationRepository || new conversation_repository_1.ConversationRepository();
        this.chatService = chatService || new chat_service_1.ChatService();
    }
    sendMessage = async (req, res, next) => {
        try {
            const { message, sessionId } = req.body;
            const result = await this.chatService.handleUserMessage(message, sessionId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getConversation = async (req, res, next) => {
        try {
            const { sessionId } = req.params;
            const conversation = await this.conversationRepository.findById(sessionId);
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            // Return response matching the API spec
            res.json({
                conversation: {
                    id: conversation.id,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt,
                },
                messages: conversation.messages.map((m) => ({
                    id: m.id,
                    conversationId: m.conversationId,
                    sender: m.sender,
                    content: m.content,
                    createdAt: m.createdAt,
                })),
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ChatController = ChatController;
