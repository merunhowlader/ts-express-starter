import { Router } from 'express';

import { authMiddleware, authService, isProduction, userService } from '../app/container.js';

import { createAuthRouter } from '../modules/auth/auth.route.js';

import { createUserRouter } from '../modules/user/user.route.js';
import healthRouter from '../modules/health/health.route.js';

export const apiRouter: Router = Router();

apiRouter.use('/auth', createAuthRouter(authService, isProduction));

apiRouter.use('/users', createUserRouter(userService, authMiddleware));

apiRouter.use('/health', healthRouter);

export default apiRouter;
