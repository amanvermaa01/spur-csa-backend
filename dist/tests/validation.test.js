"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const chat_validator_1 = require("../src/validators/chat.validator");
(0, vitest_1.describe)('Validation Schemas', () => {
    (0, vitest_1.describe)('postMessageSchema', () => {
        (0, vitest_1.it)('should validate a valid request', () => {
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: 'Do you ship internationally?',
                sessionId: 'd3b07384-d113-4ec6-a558-7beb2b4e8576',
            });
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should validate a request with no sessionId', () => {
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: 'Do you ship internationally?',
            });
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should validate a request with empty sessionId string', () => {
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: 'Do you ship internationally?',
                sessionId: '',
            });
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should reject an empty message', () => {
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: '   ',
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, vitest_1.expect)(result.error.errors[0].message).toBe('Message cannot be empty');
            }
        });
        (0, vitest_1.it)('should reject a message that is too long', () => {
            const longMessage = 'a'.repeat(2001);
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: longMessage,
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, vitest_1.expect)(result.error.errors[0].message).toBe('Message must be at most 2000 characters');
            }
        });
        (0, vitest_1.it)('should reject an invalid sessionId UUID format', () => {
            const result = chat_validator_1.postMessageSchema.safeParse({
                message: 'Valid message',
                sessionId: 'invalid-uuid',
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, vitest_1.expect)(result.error.errors[0].message).toBe('Session ID must be a valid UUID');
            }
        });
    });
    (0, vitest_1.describe)('getSessionSchema', () => {
        (0, vitest_1.it)('should validate a valid UUID sessionId', () => {
            const result = chat_validator_1.getSessionSchema.safeParse({
                sessionId: 'd3b07384-d113-4ec6-a558-7beb2b4e8576',
            });
            (0, vitest_1.expect)(result.success).toBe(true);
        });
        (0, vitest_1.it)('should reject an invalid UUID sessionId', () => {
            const result = chat_validator_1.getSessionSchema.safeParse({
                sessionId: 'not-a-uuid',
            });
            (0, vitest_1.expect)(result.success).toBe(false);
            if (!result.success) {
                (0, vitest_1.expect)(result.error.errors[0].message).toBe('Session ID must be a valid UUID');
            }
        });
    });
});
