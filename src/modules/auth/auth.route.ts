import { Router } from 'express';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

import { loginSchema } from './auth.schema.js';

import type { IAuthService } from './auth.service.js';

import { AuthController } from './auth.controller.js';

export const createAuthRouter = (
  authService: IAuthService,
): Router => {
  const router = Router();

  const controller = new AuthController(authService);

  router.post(
    '/login',
    validateRequest(loginSchema),
    controller.login,
  );

  return router;
};
