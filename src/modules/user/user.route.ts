import { Router } from 'express';
import type { RequestHandler } from 'express';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

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

  router.get('/:id', authMiddleware, validateRequest(getUserByIdSchema), controller.getUserById);

  return router;
};
