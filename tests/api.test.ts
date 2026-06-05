import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock dependencies to run tests without database connections or live LLM network requests
vi.mock('../src/repositories/conversation.repository', () => {
  return {
    ConversationRepository: vi.fn().mockImplementation(() => ({
      create: vi.fn().mockResolvedValue({
        id: '22222222-2222-2222-2222-222222222222',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: vi.fn().mockImplementation((id) => {
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
      exists: vi.fn().mockImplementation((id) => {
        return Promise.resolve(id === '11111111-1111-1111-1111-111111111111');
      }),
    })),
  };
});

vi.mock('../src/repositories/message.repository', () => {
  return {
    MessageRepository: vi.fn().mockImplementation(() => ({
      create: vi.fn().mockResolvedValue({
        id: 'msg-mock-id',
        createdAt: new Date(),
      }),
      findRecentByConversationId: vi.fn().mockResolvedValue([]),
    })),
  };
});

vi.mock('../src/services/llm/llm.service', () => {
  return {
    LLMService: vi.fn().mockImplementation(() => ({
      generateReply: vi.fn().mockResolvedValue('Mocked response from AI'),
    })),
  };
});

describe('API Routes Integration', () => {
  describe('POST /api/chat/message', () => {
    it('should create a new session if none is provided and reply successfully', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Do you ship internationally?' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reply');
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.reply).toBe('Mocked response from AI');
      expect(response.body.sessionId).toBe('22222222-2222-2222-2222-222222222222');
    });

    it('should use the existing session if valid sessionId is supplied', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'What is the return window?',
          sessionId: '11111111-1111-1111-1111-111111111111',
        });

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBe('11111111-1111-1111-1111-111111111111');
      expect(response.body.reply).toBe('Mocked response from AI');
    });

    it('should return 400 Bad Request if the message is missing or whitespace', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Message cannot be empty');
    });

    it('should return 400 Bad Request if the sessionId is malformed', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Valid message content',
          sessionId: 'not-a-valid-uuid-code',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Session ID must be a valid UUID');
    });
  });

  describe('GET /api/chat/:sessionId', () => {
    it('should return 400 Bad Request if sessionId parameter is malformed', async () => {
      const response = await request(app).get('/api/chat/malformed-id-format');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Session ID must be a valid UUID');
    });

    it('should return 404 if the valid UUID sessionId is not found', async () => {
      const nonExistentUuid = '99999999-9999-9999-9999-999999999999';
      const response = await request(app).get(`/api/chat/${nonExistentUuid}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Conversation not found');
    });

    it('should return conversation payload and messages for a valid existing sessionId', async () => {
      const existingUuid = '11111111-1111-1111-1111-111111111111';
      const response = await request(app).get(`/api/chat/${existingUuid}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversation');
      expect(response.body.conversation.id).toBe(existingUuid);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.messages).toHaveLength(2);
      expect(response.body.messages[0].content).toBe('Hello SpurMart');
      expect(response.body.messages[1].content).toBe('Hello, how can I help you?');
    });
  });
});
