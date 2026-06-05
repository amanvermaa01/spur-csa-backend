import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '../src/services/chat.service';
import { ConversationRepository } from '../src/repositories/conversation.repository';
import { MessageRepository } from '../src/repositories/message.repository';
import { LLMService } from '../src/services/llm/llm.service';
import { SenderType } from '@prisma/client';

describe('ChatService', () => {
  let mockConversationRepo: ConversationRepository;
  let mockMessageRepo: MessageRepository;
  let mockLLMService: LLMService;
  let chatService: ChatService;

  beforeEach(() => {
    mockConversationRepo = {
      create: vi.fn().mockResolvedValue({ id: 'new-conv-uuid' }),
      exists: vi.fn().mockResolvedValue(true),
      findById: vi.fn(),
    } as unknown as ConversationRepository;

    mockMessageRepo = {
      create: vi.fn().mockResolvedValue({ id: 'msg-uuid' }),
      findRecentByConversationId: vi.fn(),
    } as unknown as MessageRepository;

    mockLLMService = {
      generateReply: vi.fn().mockResolvedValue('Hello customer!'),
    } as unknown as LLMService;

    chatService = new ChatService(mockConversationRepo, mockMessageRepo, mockLLMService);
  });

  it('should process user message and return reply using an existing valid sessionId', async () => {
    const result = await chatService.handleUserMessage('Hello', 'existing-uuid');

    expect(result.reply).toBe('Hello customer!');
    expect(result.sessionId).toBe('existing-uuid');

    // Should check if session exists
    expect(mockConversationRepo.exists).toHaveBeenCalledWith('existing-uuid');
    expect(mockConversationRepo.create).not.toHaveBeenCalled();

    // Should persist user message
    expect(mockMessageRepo.create).toHaveBeenCalledWith('existing-uuid', SenderType.USER, 'Hello');

    // Should call LLM
    expect(mockLLMService.generateReply).toHaveBeenCalledWith('existing-uuid', 'Hello');

    // Should persist AI message
    expect(mockMessageRepo.create).toHaveBeenCalledWith('existing-uuid', SenderType.AI, 'Hello customer!');
  });

  it('should create a new session if sessionId is missing or invalid', async () => {
    vi.mocked(mockConversationRepo.exists).mockResolvedValue(false);

    const result = await chatService.handleUserMessage('Hello');

    expect(result.reply).toBe('Hello customer!');
    expect(result.sessionId).toBe('new-conv-uuid');

    expect(mockConversationRepo.create).toHaveBeenCalled();
    expect(mockMessageRepo.create).toHaveBeenCalledWith('new-conv-uuid', SenderType.USER, 'Hello');
  });
});
