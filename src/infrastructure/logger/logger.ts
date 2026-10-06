import pino from 'pino';
import { loadConfig } from '../../config/index.js';
import type { ILogger, LogContext } from './logger.interface.js';

const config = loadConfig();
const pinoLogger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
});

export class Logger implements ILogger {
  public info(message: string, context?: LogContext): void {
    pinoLogger.info(context ?? {}, message);
  }

  public warn(message: string, context?: LogContext): void {
    pinoLogger.warn(context ?? {}, message);
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    if (error instanceof Error) {
      pinoLogger.error(
        {
          ...context,
          err: error,
        },
        message,
      );

      return;
    }

    pinoLogger.error(
      {
        ...context,
        error,
      },
      message,
    );
  }

  public debug(message: string, context?: LogContext): void {
    pinoLogger.debug(context ?? {}, message);
  }
}

export const logger = new Logger();
