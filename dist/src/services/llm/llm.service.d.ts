import { LLMProvider } from './llm.provider';
import { MessageRepository } from '../../repositories/message.repository';
export declare class LLMService {
    private provider;
    private messageRepository;
    constructor(provider?: LLMProvider, messageRepository?: MessageRepository);
    generateReply(conversationId: string, newUserMessage: string): Promise<string>;
    private callLLMWithRetry;
}
