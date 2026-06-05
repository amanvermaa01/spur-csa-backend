import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { LLMService } from './llm/llm.service';
import { SenderType } from '@prisma/client';

export class ChatService {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;
  private llmService: LLMService;

  constructor(
    conversationRepository?: ConversationRepository,
    messageRepository?: MessageRepository,
    llmService?: LLMService
  ) {
    this.conversationRepository = conversationRepository || new ConversationRepository();
    this.messageRepository = messageRepository || new MessageRepository();
    this.llmService = llmService || new LLMService();
  }

  /**
   * Processes an incoming message from a user, updates the database logs,
   * calls the LLM with appropriate context history, and logs the response.
   */
  async handleUserMessage(message: string, sessionId?: string): Promise<{ reply: string; sessionId: string }> {
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
    await this.messageRepository.create(conversationId, SenderType.USER, message);

    // 2. Query LLM to generate the AI Reply with conversation context
    const reply = await this.llmService.generateReply(conversationId, message);

    // 3. Log and persist the AI's Message
    await this.messageRepository.create(conversationId, SenderType.AI, reply);

    return {
      reply,
      sessionId: conversationId,
    };
  }
}
