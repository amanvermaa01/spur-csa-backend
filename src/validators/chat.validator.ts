import { z } from 'zod';

export const postMessageSchema = z.object({
  message: z
    .string({
      required_error: 'Message is required',
      invalid_type_error: 'Message must be a string',
    })
    .trim()
    .min(1, { message: 'Message cannot be empty' })
    .max(2000, { message: 'Message must be at most 2000 characters' }),
  sessionId: z
    .string({
      invalid_type_error: 'Session ID must be a string',
    })
    .uuid({ message: 'Session ID must be a valid UUID' })
    .optional()
    .or(z.literal('')), // Allow empty string for session ID
});

export const getSessionSchema = z.object({
  sessionId: z
    .string({
      required_error: 'Session ID is required',
    })
    .uuid({ message: 'Session ID must be a valid UUID' }),
});
export type PostMessageInput = z.infer<typeof postMessageSchema>;
export type GetSessionInput = z.infer<typeof getSessionSchema>;
