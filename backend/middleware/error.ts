import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;
  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = (err as HttpError).statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const payload: Record<string, unknown> = {
    error: err.name || 'Error',
    message: err.message,
  };
  if (!isProd && (err as HttpError).details) {
    payload.details = (err as HttpError).details;
  }
  res.status(statusCode).json(payload);
}


