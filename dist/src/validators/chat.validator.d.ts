import { z } from 'zod';
export declare const postMessageSchema: z.ZodObject<{
    message: z.ZodString;
    sessionId: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    message: string;
    sessionId?: string | undefined;
}, {
    message: string;
    sessionId?: string | undefined;
}>;
export declare const getSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export type PostMessageInput = z.infer<typeof postMessageSchema>;
export type GetSessionInput = z.infer<typeof getSessionSchema>;
