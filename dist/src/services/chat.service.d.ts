import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { LLMService } from './llm/llm.service';
export declare class ChatService {
    private conversationRepository;
    private messageRepository;
    private llmService;
    constructor(conversationRepository?: ConversationRepository, messageRepository?: MessageRepository, llmService?: LLMService);
    /**
     * Processes an incoming message from a user, updates the database logs,
     * calls the LLM with appropriate context history, and logs the response.
     */
    handleUserMessage(message: string, sessionId?: string): Promise<{
        reply: string;
        sessionId: string;
    }>;
}
