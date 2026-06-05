export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMProvider {
  generateReply(messages: LLMMessage[], systemInstruction?: string): Promise<string>;
}
