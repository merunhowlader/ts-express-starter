import { prisma } from '../infrastructure/database/prisma/prisma.client.js';
import { PrismaUnitOfWork } from '../infrastructure/database/prisma/prisma.unit-of-work.js';

import { UserController } from '../modules/user/user.controller.js';
import { UserRepository } from '../modules/user/user.repository.js';
import { UserService } from '../modules/user/user.service.js';

const userRepository = new UserRepository(prisma);

const unitOfWork = new PrismaUnitOfWork(prisma);

const userService = new UserService(userRepository, unitOfWork);

export const userController = new UserController(userService);
