import { Router } from 'express';

import { validateRequest } from '../../common/middleware/validation.middleware.js';

import { userController } from '../../app/container.js';

import { createUserSchema } from './user.schema.js';

const router: Router = Router();

router.post('/', validateRequest(createUserSchema), userController.createUser);

router.get('/:id', userController.getUserById);

export default router;
