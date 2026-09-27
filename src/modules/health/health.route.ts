import { Router } from 'express';
import { healthController } from './health.controller.js';
import { AppError } from '../../common/errors/app.error.js';
import { ERROR_CODES } from '../../common/errors/error.codes.js';

const healthRouter: Router = Router();

healthRouter.get('/', healthController.getHealth);
healthRouter.get('/error', () => {
  throw new AppError(ERROR_CODES.BAD_REQUEST, 'This is a test error.', 400);
});
healthRouter.get('/unknown-error', () => {
  throw new Error('Database exploded');
});

export default healthRouter;
