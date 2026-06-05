import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Return the first validation error message as "error" per requirement
        const firstMessage = error.errors[0]?.message || 'Validation error';
        res.status(400).json({ error: firstMessage });
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstMessage = error.errors[0]?.message || 'Validation error';
        res.status(400).json({ error: firstMessage });
        return;
      }
      next(error);
    }
  };
};
