import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    code = 'VALIDATION_ERROR';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
    code = 'DUPLICATE_KEY_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
    code = 'CAST_ERROR';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    }
  });
};
