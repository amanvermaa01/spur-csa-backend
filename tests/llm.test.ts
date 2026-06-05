import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService } from '../src/services/llm/llm.service';
import { LLMProvider, LLMMessage } from '../src/services/llm/llm.provider';
import { MessageRepository } from '../src/repositories/message.repository';
import { SenderType, Message } from '@prisma/client';

describe('LLMService', () => {
  let mockProvider: LLMProvider;
  let mockMessageRepo: MessageRepository;
  let llmService: LLMService;

  beforeEach(() => {
    mockProvider = {
      generateReply: vi.fn(),
    };
    mockMessageRepo = {
      create: vi.fn(),
      findRecentByConversationId: vi.fn(),
    } as unknown as MessageRepository;

    llmService = new LLMService(mockProvider, mockMessageRepo);
  });

  it('should successfully generate a reply in normal conditions', async () => {
    const mockHistory: Message[] = [
      { id: '1', conversationId: 'conv-1', sender: SenderType.USER, content: 'Hello', createdAt: new Date() },
      { id: '2', conversationId: 'conv-1', sender: SenderType.AI, content: 'Hi, how can I help?', createdAt: new Date() },
    ];

    vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue(mockHistory);
    vi.mocked(mockProvider.generateReply).mockResolvedValue('Here is your answer');

    const reply = await llmService.generateReply('conv-1', 'Do you ship to Germany?');

    expect(reply).toBe('Here is your answer');
    expect(mockMessageRepo.findRecentByConversationId).toHaveBeenCalledWith('conv-1', 10);
    expect(mockProvider.generateReply).toHaveBeenCalled();
  });

  it('should implement retry mechanism and fallback on total failure', async () => {
    vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue([]);
    vi.mocked(mockProvider.generateReply).mockRejectedValue(new Error('API Rate Limit Exceeded'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const reply = await llmService.generateReply('conv-1', 'Hello');

    // Should return fallback error message
    expect(reply).toBe("I'm currently experiencing technical difficulties. Please try again shortly.");
    // Should have tried 3 times (1 initial + 2 retries)
    expect(mockProvider.generateReply).toHaveBeenCalledTimes(3);

    consoleSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should correctly format messages and enforce system instruction', async () => {
    vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue([]);
    vi.mocked(mockProvider.generateReply).mockResolvedValue('Stub reply');

    await llmService.generateReply('conv-1', 'Do you ship internationally?');

    const lastCallArgs = vi.mocked(mockProvider.generateReply).mock.calls[0];
    const messagesArg = lastCallArgs[0] as LLMMessage[];
    const systemInstructionArg = lastCallArgs[1] as string;

    // Verify system instruction contains required store policies
    expect(systemInstructionArg).toContain('SpurMart');
    expect(systemInstructionArg).toContain('Shipping Policy');
    expect(systemInstructionArg).toContain('Return Policy');

    // Verify messages structure
    expect(messagesArg).toHaveLength(1);
    expect(messagesArg[0]).toEqual({
      role: 'user',
      content: 'Do you ship internationally?',
    });
  });
});
