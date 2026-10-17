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
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File size exceeds maximum allowed limit of 5MB' : err.message;
    code = err.code || 'UPLOAD_ERROR';
  } else if (err.message && (err.message.includes('Only PDF') || err.message.includes('allowed'))) {
    statusCode = 400;
    code = 'INVALID_FILE_TYPE';
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
