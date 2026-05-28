import { Request, Response, NextFunction } from 'express';

// Custom error handler middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    // Only show stack in dev
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
