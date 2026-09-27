import type { Request } from 'express';

export type TypedRequest<
  TParams = Record<string, never>,
  TResponseBody = unknown,
  TRequestBody = unknown,
  TQuery = Record<string, never>,
> = Request<TParams, TResponseBody, TRequestBody, TQuery>;
