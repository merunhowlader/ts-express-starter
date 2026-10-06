import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import apiRouter from '../routes/index.js';
import { errorHandler } from '../common/errors/error.handler.js';
import { notFoundHandler } from '../common/middleware/error.middleware.js';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from '../common/middleware/request-id.middleware.js';
import { requestLoggingMiddleware } from '../common/middleware/request-logging.middleware.js';
import { loadConfig } from '../config/index.js';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from '../docs/openapi.js';
export function createApp(): Express {
  const config = loadConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
