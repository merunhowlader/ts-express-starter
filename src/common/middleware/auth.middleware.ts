import type { RequestHandler } from 'express';

import { UserRole } from '../../generated/prisma/client.js';

import { HTTP_STATUS } from '../constants/http.constants.js';
import { AppError } from '../errors/app.error.js';
import { ERROR_CODES } from '../errors/error.codes.js';
import type { ITokenService } from '../interfaces/token.interface.js';

export const createAuthMiddleware = (tokenService: ITokenService): RequestHandler => {
  return (req, _res, next): void => {
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

      if (!isUserRole(payload.role)) {
        throw new Error('Invalid user role in access token.');
      }

      req.user = {
        id: payload.sub,
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

function isUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
