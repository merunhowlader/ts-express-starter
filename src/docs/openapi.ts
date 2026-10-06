import type { OpenAPIV3 } from 'openapi-types';

export const openApiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',

  info: {
    title: 'Node Express TypeScript Starter API',
    version: '1.0.0',
    description: 'Production-oriented Node.js, Express, and TypeScript starter API.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Application health endpoints',
    },
    {
      name: 'Authentication',
      description: 'Authentication and session endpoints',
    },
    {
      name: 'Users',
      description: 'User profile endpoints',
    },
  ],

  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Application is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Current user profile',
          },
          '401': {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Access denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request',
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        security: [
          {
            refreshCookie: [],
          },
        ],
        responses: {
          '200': {
            description: 'Access token refreshed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid or expired refresh token',
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout current session',
        security: [
          {
            refreshCookie: [],
          },
        ],
        responses: {
          '204': {
            description: 'Logout successful',
          },
          '401': {
            description: 'Authentication required',
          },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      refreshCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        required: ['status', 'timestamp'],
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2026-10-06T18:00:00.000Z',
          },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'StrongPassword123!',
          },
        },
      },

      AuthResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            required: ['accessToken'],
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOi...',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                example: 'UNAUTHORIZED',
              },
              message: {
                type: 'string',
                example: 'Authentication required',
              },
              details: {
                nullable: true,
                example: null,
              },
            },
          },
          meta: {
            type: 'object',
            properties: {
              requestId: {
                type: 'string',
                example: '8f3d9a2c-1234-4567-8901-abcdef123456',
              },
            },
          },
        },
      },
    },
  },
};
