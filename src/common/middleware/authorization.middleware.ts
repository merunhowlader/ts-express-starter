import type { NextFunction, Request, Response } from 'express';

import type { UserRole } from '../../generated/prisma/client.js';

import { HTTP_STATUS } from '../constants/http.constants.js';

import { ROLE_PERMISSIONS } from '../constants/role-permission.constants.js';

import type { Permission } from '../constants/permission.constants.js';

import { AppError } from '../errors/app.error.js';

import { ERROR_CODES } from '../errors/error.codes.js';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (user === undefined) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication is required.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to perform this action.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (user === undefined) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication is required.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const userPermissions = ROLE_PERMISSIONS[user.role];

    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasRequiredPermissions) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to perform this action.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    next();
  };
};
