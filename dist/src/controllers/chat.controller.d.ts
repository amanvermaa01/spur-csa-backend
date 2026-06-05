import { Request, Response, NextFunction } from 'express';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ChatService } from '../services/chat.service';
export declare class ChatController {
    private conversationRepository;
    private chatService;
    constructor(conversationRepository?: ConversationRepository, chatService?: ChatService);
    sendMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getConversation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
