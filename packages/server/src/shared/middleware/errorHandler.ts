import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '@edusphere/shared';
import { ERROR_CODES } from '@edusphere/shared';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof AppError) {
    // Operational errors - send to client
    logger.error(`Operational error: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });

    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Programming or unknown errors
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };

  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
    },
  };

  res.status(404).json(response);
};
