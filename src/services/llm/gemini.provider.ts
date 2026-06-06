import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMMessage } from './llm.provider';

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {}

  private getClient(): GoogleGenerativeAI {
    if (this.genAI) return this.genAI;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    return this.genAI;
  }

  async generateReply(messages: LLMMessage[], systemInstruction?: string): Promise<string> {
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
    });

    // Map roles: 'user' -> 'user', 'assistant' -> 'model'
    // Filter out 'system' messages because they are configured via systemInstruction
    const rawContents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

    // Collapse consecutive messages of the same role to prevent Gemini API validation errors
    const contents: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of rawContents) {
      if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
        contents[contents.length - 1].parts[0].text += '\n' + msg.content;
      } else {
        contents.push({
          role: msg.role,
          parts: [{ text: msg.content }],
        });
      }
    }

    const result = await model.generateContent({
      contents,
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini API returned an empty response');
    }

    return text;
  }
}
