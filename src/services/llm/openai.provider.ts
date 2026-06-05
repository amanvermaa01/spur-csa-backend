import { LLMProvider, LLMMessage } from './llm.provider';

export class OpenAIProvider implements LLMProvider {
  constructor() {
    // OpenAI client initialization would go here in actual implementation
  }

  async generateReply(messages: LLMMessage[], systemInstruction?: string): Promise<string> {
    throw new Error('OpenAIProvider is not active. Use GeminiProvider instead.');
  }
}
