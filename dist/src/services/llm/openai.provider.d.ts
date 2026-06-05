import { LLMProvider, LLMMessage } from './llm.provider';
export declare class OpenAIProvider implements LLMProvider {
    constructor();
    generateReply(messages: LLMMessage[], systemInstruction?: string): Promise<string>;
}
