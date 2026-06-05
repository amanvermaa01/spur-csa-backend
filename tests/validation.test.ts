import { describe, it, expect } from 'vitest';
import { postMessageSchema, getSessionSchema } from '../src/validators/chat.validator';

describe('Validation Schemas', () => {
  describe('postMessageSchema', () => {
    it('should validate a valid request', () => {
      const result = postMessageSchema.safeParse({
        message: 'Do you ship internationally?',
        sessionId: 'd3b07384-d113-4ec6-a558-7beb2b4e8576',
      });
      expect(result.success).toBe(true);
    });

    it('should validate a request with no sessionId', () => {
      const result = postMessageSchema.safeParse({
        message: 'Do you ship internationally?',
      });
      expect(result.success).toBe(true);
    });

    it('should validate a request with empty sessionId string', () => {
      const result = postMessageSchema.safeParse({
        message: 'Do you ship internationally?',
        sessionId: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject an empty message', () => {
      const result = postMessageSchema.safeParse({
        message: '   ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Message cannot be empty');
      }
    });

    it('should reject a message that is too long', () => {
      const longMessage = 'a'.repeat(2001);
      const result = postMessageSchema.safeParse({
        message: longMessage,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Message must be at most 2000 characters');
      }
    });

    it('should reject an invalid sessionId UUID format', () => {
      const result = postMessageSchema.safeParse({
        message: 'Valid message',
        sessionId: 'invalid-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Session ID must be a valid UUID');
      }
    });
  });

  describe('getSessionSchema', () => {
    it('should validate a valid UUID sessionId', () => {
      const result = getSessionSchema.safeParse({
        sessionId: 'd3b07384-d113-4ec6-a558-7beb2b4e8576',
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid UUID sessionId', () => {
      const result = getSessionSchema.safeParse({
        sessionId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Session ID must be a valid UUID');
      }
    });
  });
});
