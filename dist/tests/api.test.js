"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
// Mock dependencies to run tests without database connections or live LLM network requests
vitest_1.vi.mock('../src/repositories/conversation.repository', () => {
    return {
        ConversationRepository: vitest_1.vi.fn().mockImplementation(() => ({
            create: vitest_1.vi.fn().mockResolvedValue({
                id: '22222222-2222-2222-2222-222222222222',
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
            findById: vitest_1.vi.fn().mockImplementation((id) => {
                if (id === '11111111-1111-1111-1111-111111111111') {
                    return Promise.resolve({
                        id: '11111111-1111-1111-1111-111111111111',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        messages: [
                            {
                                id: 'msg-1',
                                conversationId: '11111111-1111-1111-1111-111111111111',
                                sender: 'USER',
                                content: 'Hello SpurMart',
                                createdAt: new Date(),
                            },
                            {
                                id: 'msg-2',
                                conversationId: '11111111-1111-1111-1111-111111111111',
                                sender: 'AI',
                                content: 'Hello, how can I help you?',
                                createdAt: new Date(),
                            },
                        ],
                    });
                }
                return Promise.resolve(null);
            }),
            exists: vitest_1.vi.fn().mockImplementation((id) => {
                return Promise.resolve(id === '11111111-1111-1111-1111-111111111111');
            }),
        })),
    };
});
vitest_1.vi.mock('../src/repositories/message.repository', () => {
    return {
        MessageRepository: vitest_1.vi.fn().mockImplementation(() => ({
            create: vitest_1.vi.fn().mockResolvedValue({
                id: 'msg-mock-id',
                createdAt: new Date(),
            }),
            findRecentByConversationId: vitest_1.vi.fn().mockResolvedValue([]),
        })),
    };
});
vitest_1.vi.mock('../src/services/llm/llm.service', () => {
    return {
        LLMService: vitest_1.vi.fn().mockImplementation(() => ({
            generateReply: vitest_1.vi.fn().mockResolvedValue('Mocked response from AI'),
        })),
    };
});
(0, vitest_1.describe)('API Routes Integration', () => {
    (0, vitest_1.describe)('POST /api/chat/message', () => {
        (0, vitest_1.it)('should create a new session if none is provided and reply successfully', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/chat/message')
                .send({ message: 'Do you ship internationally?' });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('reply');
            (0, vitest_1.expect)(response.body).toHaveProperty('sessionId');
            (0, vitest_1.expect)(response.body.reply).toBe('Mocked response from AI');
            (0, vitest_1.expect)(response.body.sessionId).toBe('22222222-2222-2222-2222-222222222222');
        });
        (0, vitest_1.it)('should use the existing session if valid sessionId is supplied', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/chat/message')
                .send({
                message: 'What is the return window?',
                sessionId: '11111111-1111-1111-1111-111111111111',
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.sessionId).toBe('11111111-1111-1111-1111-111111111111');
            (0, vitest_1.expect)(response.body.reply).toBe('Mocked response from AI');
        });
        (0, vitest_1.it)('should return 400 Bad Request if the message is missing or whitespace', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/chat/message')
                .send({ message: '   ' });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
            (0, vitest_1.expect)(response.body.error).toBe('Message cannot be empty');
        });
        (0, vitest_1.it)('should return 400 Bad Request if the sessionId is malformed', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/chat/message')
                .send({
                message: 'Valid message content',
                sessionId: 'not-a-valid-uuid-code',
            });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body).toHaveProperty('error');
            (0, vitest_1.expect)(response.body.error).toBe('Session ID must be a valid UUID');
        });
    });
    (0, vitest_1.describe)('GET /api/chat/:sessionId', () => {
        (0, vitest_1.it)('should return 400 Bad Request if sessionId parameter is malformed', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/chat/malformed-id-format');
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.error).toBe('Session ID must be a valid UUID');
        });
        (0, vitest_1.it)('should return 404 if the valid UUID sessionId is not found', async () => {
            const nonExistentUuid = '99999999-9999-9999-9999-999999999999';
            const response = await (0, supertest_1.default)(app_1.default).get(`/api/chat/${nonExistentUuid}`);
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body.error).toBe('Conversation not found');
        });
        (0, vitest_1.it)('should return conversation payload and messages for a valid existing sessionId', async () => {
            const existingUuid = '11111111-1111-1111-1111-111111111111';
            const response = await (0, supertest_1.default)(app_1.default).get(`/api/chat/${existingUuid}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toHaveProperty('conversation');
            (0, vitest_1.expect)(response.body.conversation.id).toBe(existingUuid);
            (0, vitest_1.expect)(response.body).toHaveProperty('messages');
            (0, vitest_1.expect)(response.body.messages).toHaveLength(2);
            (0, vitest_1.expect)(response.body.messages[0].content).toBe('Hello SpurMart');
            (0, vitest_1.expect)(response.body.messages[1].content).toBe('Hello, how can I help you?');
        });
    });
});
