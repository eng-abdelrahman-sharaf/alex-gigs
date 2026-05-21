import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle Postgres Unique/Foreign Key Violations
  const pgErr = err as any;
  if (pgErr.code === '23505') {
    // Unique violation
    return res.status(409).json({
      status: 'fail',
      message: pgErr.detail || 'A resource with this value already exists.'
    });
  }
  if (pgErr.code === '23503') {
    // Foreign key violation
    return res.status(404).json({
      status: 'fail',
      message: 'Referenced resource does not exist.'
    });
  }

  console.error('💥 Unhandled Error:', err);

  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};
