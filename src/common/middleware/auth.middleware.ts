import type { NextFunction, Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http.constants.js';

import { AppError } from '../errors/app.error.js';

import { ERROR_CODES } from '../errors/error.codes.js';

import type { ITokenService } from '../interfaces/token.interface.js';

export const createAuthMiddleware = (tokenService: ITokenService) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      next(
        new AppError(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required.',
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      return;
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      next(
        new AppError(
          ERROR_CODES.UNAUTHORIZED,
          'Invalid authorization header.',
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );

      return;
    }

    try {
      const payload = tokenService.verifyAccessToken(token);

      const userId = Number(payload.sub);

      if (!Number.isInteger(userId)) {
        throw new Error('Invalid user ID in access token.');
      }

      req.user = {
        id: userId,
        role: payload.role,
      };

      next();
    } catch {
      next(
        new AppError(
          ERROR_CODES.UNAUTHORIZED,
          'Invalid or expired access token.',
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
    }
  };
};
