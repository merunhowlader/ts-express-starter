import type { RequestHandler } from 'express';

import { CSRF_TOKEN_COOKIE_NAME, CSRF_TOKEN_HEADER } from '../constants/auth.constants.js';

import { HTTP_STATUS } from '../constants/http.constants.js';

import { AppError } from '../errors/app.error.js';

import { ERROR_CODES } from '../errors/error.codes.js';

export const csrfMiddleware: RequestHandler = (req, _res, next): void => {
  console.log('comming to midleware ');
  const cookieToken = req.cookies[CSRF_TOKEN_COOKIE_NAME];

  const headerToken = req.get(CSRF_TOKEN_HEADER);

  if (typeof cookieToken !== 'string' || typeof headerToken !== 'string') {
    next(new AppError(ERROR_CODES.FORBIDDEN, 'Invalid CSRF token.', HTTP_STATUS.FORBIDDEN));

    return;
  }

  if (cookieToken !== headerToken) {
    next(new AppError(ERROR_CODES.FORBIDDEN, 'Invalid CSRF token.', HTTP_STATUS.FORBIDDEN));

    return;
  }

  next();
};
