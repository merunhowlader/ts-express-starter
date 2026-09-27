import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

type RequestValidationSchema<T> = ZodType<T>;

export const validateRequest = <
  T extends {
    body?: unknown;
    query?: unknown;
    params?: unknown;
  },
>(
  schema: RequestValidationSchema<T>,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    if (result.data.body !== undefined) {
      req.body = result.data.body;
    }

    next();
  };
};
