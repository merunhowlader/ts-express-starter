import { describe, expect, it } from '@jest/globals';

import request from 'supertest';

import { createApp } from '../../src/app/app.js';

describe('API E2E', () => {
  const app = createApp();

  describe('Health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'ok',
        }),
      );
    });
  });

  describe('Error handling', () => {
    it('should return a known application error', async () => {
      const response = await request(app).get('/api/v1/health/error').expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BAD_REQUEST',
          }),
        }),
      );
    });

    it('should return 500 for an unknown error', async () => {
      const response = await request(app).get('/api/v1/health/unknown-error').expect(500);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
          }),
        }),
      );
    });
  });

  describe('Authentication', () => {
    it('should reject an unauthenticated request', async () => {
      const response = await request(app).get('/api/v1/users/user-123').expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        }),
      );
    });
  });
});
