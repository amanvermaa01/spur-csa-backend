"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionSchema = exports.postMessageSchema = void 0;
const zod_1 = require("zod");
exports.postMessageSchema = zod_1.z.object({
    message: zod_1.z
        .string({
        required_error: 'Message is required',
        invalid_type_error: 'Message must be a string',
    })
        .trim()
        .min(1, { message: 'Message cannot be empty' })
        .max(2000, { message: 'Message must be at most 2000 characters' }),
    sessionId: zod_1.z
        .string({
        invalid_type_error: 'Session ID must be a string',
    })
        .uuid({ message: 'Session ID must be a valid UUID' })
        .optional()
        .or(zod_1.z.literal('')), // Allow empty string for session ID
});
exports.getSessionSchema = zod_1.z.object({
    sessionId: zod_1.z
        .string({
        required_error: 'Session ID is required',
    })
        .uuid({ message: 'Session ID must be a valid UUID' }),
});
