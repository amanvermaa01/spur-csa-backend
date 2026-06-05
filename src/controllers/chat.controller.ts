import { Request, Response, NextFunction } from 'express';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ChatService } from '../services/chat.service';

export class ChatController {
  private conversationRepository: ConversationRepository;
  private chatService: ChatService;

  constructor(
    conversationRepository?: ConversationRepository,
    chatService?: ChatService
  ) {
    this.conversationRepository = conversationRepository || new ConversationRepository();
    this.chatService = chatService || new ChatService();
  }

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, sessionId } = req.body;
      const result = await this.chatService.handleUserMessage(message, sessionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };


  getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    } catch (error) {
      next(error);
    }
  };
}
