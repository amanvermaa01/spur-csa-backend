import { Message, SenderType } from '@prisma/client';
export declare class MessageRepository {
    create(conversationId: string, sender: SenderType, content: string): Promise<Message>;
    findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]>;
}
