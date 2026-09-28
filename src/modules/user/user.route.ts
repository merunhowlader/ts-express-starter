import { Router } from 'express';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

import { authMiddleware } from '../../app/container.js';

import type { IUserService } from './user.service.js';

import { UserController } from './user.controller.js';

import { createUserSchema } from './user.schema.js';

export const createUserRouter = (userService: IUserService): Router => {
  const router = Router();

  const controller = new UserController(userService);

  router.post('/', validateRequest(createUserSchema), controller.createUser);

  router.get('/:id', authMiddleware, controller.getUserById);

  return router;
};
