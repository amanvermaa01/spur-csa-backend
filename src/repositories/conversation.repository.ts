import prisma from '../lib/prisma';
import { Conversation, Message } from '@prisma/client';

export class ConversationRepository {
  async create(): Promise<Conversation> {
    return prisma.conversation.create({
      data: {},
    });
  }

  async findById(id: string): Promise<(Conversation & { messages: Message[] }) | null> {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.conversation.count({
      where: { id },
    });
    return count > 0;
  }
}
