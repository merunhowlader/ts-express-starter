import { Router } from 'express';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

import { loginSchema } from './auth.schema.js';

import type { IAuthService } from './auth.service.js';

import { AuthController } from './auth.controller.js';
import { csrfMiddleware } from '../../common/middleware/csrf.middleware.js';

export const createAuthRouter = (authService: IAuthService, isProduction: boolean): Router => {
  const router = Router();

  const controller = new AuthController(authService, isProduction);

  router.post('/login', validateRequest(loginSchema), controller.login);

  router.post('/refresh', csrfMiddleware, controller.refresh);
  router.get('/csrf', controller.getCsrf);

  return router;
};
