"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const llm_service_1 = require("../src/services/llm/llm.service");
const client_1 = require("@prisma/client");
(0, vitest_1.describe)('LLMService', () => {
    let mockProvider;
    let mockMessageRepo;
    let llmService;
    (0, vitest_1.beforeEach)(() => {
        mockProvider = {
            generateReply: vitest_1.vi.fn(),
        };
        mockMessageRepo = {
            create: vitest_1.vi.fn(),
            findRecentByConversationId: vitest_1.vi.fn(),
        };
        llmService = new llm_service_1.LLMService(mockProvider, mockMessageRepo);
    });
    (0, vitest_1.it)('should successfully generate a reply in normal conditions', async () => {
        const mockHistory = [
            { id: '1', conversationId: 'conv-1', sender: client_1.SenderType.USER, content: 'Hello', createdAt: new Date() },
            { id: '2', conversationId: 'conv-1', sender: client_1.SenderType.AI, content: 'Hi, how can I help?', createdAt: new Date() },
        ];
        vitest_1.vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue(mockHistory);
        vitest_1.vi.mocked(mockProvider.generateReply).mockResolvedValue('Here is your answer');
        const reply = await llmService.generateReply('conv-1', 'Do you ship to Germany?');
        (0, vitest_1.expect)(reply).toBe('Here is your answer');
        (0, vitest_1.expect)(mockMessageRepo.findRecentByConversationId).toHaveBeenCalledWith('conv-1', 10);
        (0, vitest_1.expect)(mockProvider.generateReply).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should implement retry mechanism and fallback on total failure', async () => {
        vitest_1.vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue([]);
        vitest_1.vi.mocked(mockProvider.generateReply).mockRejectedValue(new Error('API Rate Limit Exceeded'));
        const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
        const warnSpy = vitest_1.vi.spyOn(console, 'warn').mockImplementation(() => { });
        const reply = await llmService.generateReply('conv-1', 'Hello');
        // Should return fallback error message
        (0, vitest_1.expect)(reply).toBe("I'm currently experiencing technical difficulties. Please try again shortly.");
        // Should have tried 3 times (1 initial + 2 retries)
        (0, vitest_1.expect)(mockProvider.generateReply).toHaveBeenCalledTimes(3);
        consoleSpy.mockRestore();
        warnSpy.mockRestore();
    });
    (0, vitest_1.it)('should correctly format messages and enforce system instruction', async () => {
        vitest_1.vi.mocked(mockMessageRepo.findRecentByConversationId).mockResolvedValue([]);
        vitest_1.vi.mocked(mockProvider.generateReply).mockResolvedValue('Stub reply');
        await llmService.generateReply('conv-1', 'Do you ship internationally?');
        const lastCallArgs = vitest_1.vi.mocked(mockProvider.generateReply).mock.calls[0];
        const messagesArg = lastCallArgs[0];
        const systemInstructionArg = lastCallArgs[1];
        // Verify system instruction contains required store policies
        (0, vitest_1.expect)(systemInstructionArg).toContain('SpurMart');
        (0, vitest_1.expect)(systemInstructionArg).toContain('Shipping Policy');
        (0, vitest_1.expect)(systemInstructionArg).toContain('Return Policy');
        // Verify messages structure
        (0, vitest_1.expect)(messagesArg).toHaveLength(1);
        (0, vitest_1.expect)(messagesArg[0]).toEqual({
            role: 'user',
            content: 'Do you ship internationally?',
        });
    });
});
