import type { AuthenticatedRequestUser } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
      requestId: string;
    }
  }
}

export {};
