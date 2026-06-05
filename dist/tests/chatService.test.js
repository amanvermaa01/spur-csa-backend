"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const chat_service_1 = require("../src/services/chat.service");
const client_1 = require("@prisma/client");
(0, vitest_1.describe)('ChatService', () => {
    let mockConversationRepo;
    let mockMessageRepo;
    let mockLLMService;
    let chatService;
    (0, vitest_1.beforeEach)(() => {
        mockConversationRepo = {
            create: vitest_1.vi.fn().mockResolvedValue({ id: 'new-conv-uuid' }),
            exists: vitest_1.vi.fn().mockResolvedValue(true),
            findById: vitest_1.vi.fn(),
        };
        mockMessageRepo = {
            create: vitest_1.vi.fn().mockResolvedValue({ id: 'msg-uuid' }),
            findRecentByConversationId: vitest_1.vi.fn(),
        };
        mockLLMService = {
            generateReply: vitest_1.vi.fn().mockResolvedValue('Hello customer!'),
        };
        chatService = new chat_service_1.ChatService(mockConversationRepo, mockMessageRepo, mockLLMService);
    });
    (0, vitest_1.it)('should process user message and return reply using an existing valid sessionId', async () => {
        const result = await chatService.handleUserMessage('Hello', 'existing-uuid');
        (0, vitest_1.expect)(result.reply).toBe('Hello customer!');
        (0, vitest_1.expect)(result.sessionId).toBe('existing-uuid');
        // Should check if session exists
        (0, vitest_1.expect)(mockConversationRepo.exists).toHaveBeenCalledWith('existing-uuid');
        (0, vitest_1.expect)(mockConversationRepo.create).not.toHaveBeenCalled();
        // Should persist user message
        (0, vitest_1.expect)(mockMessageRepo.create).toHaveBeenCalledWith('existing-uuid', client_1.SenderType.USER, 'Hello');
        // Should call LLM
        (0, vitest_1.expect)(mockLLMService.generateReply).toHaveBeenCalledWith('existing-uuid', 'Hello');
        // Should persist AI message
        (0, vitest_1.expect)(mockMessageRepo.create).toHaveBeenCalledWith('existing-uuid', client_1.SenderType.AI, 'Hello customer!');
    });
    (0, vitest_1.it)('should create a new session if sessionId is missing or invalid', async () => {
        vitest_1.vi.mocked(mockConversationRepo.exists).mockResolvedValue(false);
        const result = await chatService.handleUserMessage('Hello');
        (0, vitest_1.expect)(result.reply).toBe('Hello customer!');
        (0, vitest_1.expect)(result.sessionId).toBe('new-conv-uuid');
        (0, vitest_1.expect)(mockConversationRepo.create).toHaveBeenCalled();
        (0, vitest_1.expect)(mockMessageRepo.create).toHaveBeenCalledWith('new-conv-uuid', client_1.SenderType.USER, 'Hello');
    });
});
