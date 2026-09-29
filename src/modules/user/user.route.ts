import { Router } from 'express';
import type { RequestHandler } from 'express';

import { requirePermissions } from '../../common/middleware/authorization.middleware.js';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

import { PERMISSIONS } from '../../common/constants/permission.constants.js';

import { createUserSchema, getUserByIdSchema } from './user.schema.js';

import type { IUserService } from './user.service.js';

import { UserController } from './user.controller.js';

export const createUserRouter = (
  userService: IUserService,
  authMiddleware: RequestHandler,
): Router => {
  const router = Router();

  const controller = new UserController(userService);

  router.post('/', validateRequest(createUserSchema), controller.createUser);

  router.get(
    '/:id',
    authMiddleware,
    requirePermissions(PERMISSIONS.USER_READ),
    validateRequest(getUserByIdSchema),
    controller.getUserById,
  );

  return router;
};
