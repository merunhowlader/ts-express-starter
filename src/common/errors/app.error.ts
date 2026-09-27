import type { HttpStatus } from '../constants/http.constants.js';

import type { ErrorCode } from './error.codes.js';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatus;
  public readonly details: unknown;

  public constructor(
    code: ErrorCode,
    message: string,
    statusCode: HttpStatus,
    details: unknown = null,
  ) {
    super(message);

    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
