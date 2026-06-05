import { Conversation, Message } from '@prisma/client';
export declare class ConversationRepository {
    create(): Promise<Conversation>;
    findById(id: string): Promise<(Conversation & {
        messages: Message[];
    }) | null>;
    exists(id: string): Promise<boolean>;
}
