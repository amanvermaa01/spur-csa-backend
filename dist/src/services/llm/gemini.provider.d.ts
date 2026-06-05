import { LLMProvider, LLMMessage } from './llm.provider';
export declare class GeminiProvider implements LLMProvider {
    private genAI;
    constructor();
    generateReply(messages: LLMMessage[], systemInstruction?: string): Promise<string>;
}
