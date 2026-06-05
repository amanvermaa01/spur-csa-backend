import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Unhandled Server Error]:', error);

  // Return a safe error message without leaking stack traces or internal secrets
  res.status(500).json({
    error: 'An unexpected error occurred on the server. Please try again later.',
  });
};
