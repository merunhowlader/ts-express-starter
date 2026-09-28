import { prisma } from '../infrastructure/database/prisma/prisma.client.js';

import { PrismaUnitOfWork } from '../infrastructure/database/prisma/prisma.unit-of-work.js';

import { UserRepository } from '../modules/user/user.repository.js';

import { UserService } from '../modules/user/user.service.js';

import { AuthService } from '../modules/auth/auth.service.js';

const userRepository = new UserRepository(prisma);

const unitOfWork = new PrismaUnitOfWork(prisma);

export const userService = new UserService(userRepository, unitOfWork);

export const authService = new AuthService(userRepository);
