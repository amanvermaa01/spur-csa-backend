"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateBody = void 0;
const zod_1 = require("zod");
const validateBody = (schema) => {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Return the first validation error message as "error" per requirement
                const firstMessage = error.errors[0]?.message || 'Validation error';
                res.status(400).json({ error: firstMessage });
                return;
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
const validateParams = (schema) => {
    return async (req, res, next) => {
        try {
            req.params = await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const firstMessage = error.errors[0]?.message || 'Validation error';
                res.status(400).json({ error: firstMessage });
                return;
            }
            next(error);
        }
    };
};
exports.validateParams = validateParams;
