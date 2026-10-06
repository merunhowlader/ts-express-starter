import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { HTTP_STATUS } from '../constants/http.constants.js';
import { logger } from '../../infrastructure/logger/logger.js';

import { AppError } from './app.error.js';
import { ERROR_CODES } from './error.codes.js';
import type { ErrorResponse } from './error.types.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next): void => {
  logger.error('Request failed', error, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
  });

  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        requestId: req.requestId,
      },
    };

    res.status(error.statusCode).json(response);

    return;
  }

  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed.',
        details: error.issues,
      },
      meta: {
        requestId: req.requestId,
      },
    };

    res.status(HTTP_STATUS.UNPROCESSABLE_CONTENT).json(response);

    return;
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Internal server error.',
      details: null,
    },
    meta: {
      requestId: req.requestId,
    },
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};
