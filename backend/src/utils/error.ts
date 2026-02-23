import { Request, Response } from '@google-cloud/functions-framework';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleError(err: unknown, res: Response) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }
  
  // Zod Validation Error — no details leaked to client
  if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Invalid data format',
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
  });
}
