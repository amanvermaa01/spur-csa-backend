import prisma from '../lib/prisma';
import { Message, SenderType } from '@prisma/client';

export class MessageRepository {
  async create(conversationId: string, sender: SenderType, content: string): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId,
        sender,
        content,
      },
    });
  }

  async findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Return in chronological order (oldest to newest)
    return messages.reverse();
  }
}
