import type { ErrorCode } from './error.codes.js';
export type ErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details: unknown;
  };
  meta?: {
    requestId?: string;
  };
};
