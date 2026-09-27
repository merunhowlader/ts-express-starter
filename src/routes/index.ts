import { Router } from 'express';

import healthRouter from '../modules/health/health.route.js';
import userRouter from '../modules/user/user.route.js';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/users', userRouter);

export default router;
