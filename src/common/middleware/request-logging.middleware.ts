import type { Request, Response, NextFunction } from 'express';

import { logger } from '../../infrastructure/logger/logger.js';

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;

    logger.info('HTTP request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
