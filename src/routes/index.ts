import { Router } from 'express';

import healthRouter from '../modules/health/health.route.js';

import { authService, userService, isProduction } from '../app/container.js';

import { createAuthRouter } from '../modules/auth/auth.route.js';

import { createUserRouter } from '../modules/user/user.route.js';

const router: Router = Router();

router.use('/health', healthRouter);

router.use('/users', createUserRouter(userService));

router.use('/auth', createAuthRouter(authService, isProduction));

export default router;
