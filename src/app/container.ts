import { RequestHandler } from 'express';
import { createAuthMiddleware } from '../common/middleware/auth.middleware.js';
import { loadConfig } from '../config/index.js';

import { JwtTokenService } from '../infrastructure/auth/jwt-token.service.js';

import { prisma } from '../infrastructure/database/prisma/prisma.client.js';

import { PrismaUnitOfWork } from '../infrastructure/database/prisma/prisma.unit-of-work.js';

import { AuthRepository } from '../modules/auth/auth.repository.js';
import { AuthService } from '../modules/auth/auth.service.js';

import { UserRepository } from '../modules/user/user.repository.js';
import { UserService } from '../modules/user/user.service.js';
import { GoogleOAuthProvider } from '../infrastructure/auth/oauth/google-oauth.provider.js';

const config = loadConfig();

export const isProduction = config.nodeEnv === 'production';

const userRepository = new UserRepository(prisma);

const authRepository = new AuthRepository(prisma);

const unitOfWork = new PrismaUnitOfWork(prisma);

const tokenService = new JwtTokenService(config.jwt.accessSecret, config.jwt.accessExpiresIn);

export const authMiddleware: RequestHandler = createAuthMiddleware(tokenService);

export const userService = new UserService(userRepository, unitOfWork);
const googleOAuthProvider = new GoogleOAuthProvider(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri,
);
export const authService = new AuthService(
  userRepository,
  authRepository,
  tokenService,
  config.jwt.refreshExpiresIn,
  googleOAuthProvider,
);
