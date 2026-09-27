import type { RequestHandler } from 'express';

import { HTTP_STATUS } from '../constants/http.constants.js';
import { AppError } from '../errors/app.error.js';
import { ERROR_CODES } from '../errors/error.codes.js';

export const notFoundHandler: RequestHandler = (req, _res, next): void => {
  next(
    new AppError(
      ERROR_CODES.NOT_FOUND,
      `Route ${req.method} ${req.originalUrl} not found.`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
};
