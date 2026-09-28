import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import { AppError } from '../../common/errors/app.error.js';

import { ERROR_CODES } from '../../common/errors/error.codes.js';

import type { IUnitOfWork } from '../../common/interfaces/unit-of-work.interface.js';

import type { PrismaTransactionClient } from '../../infrastructure/database/prisma/prisma.transaction.js';

import type { IUserRepository } from './user.interface.js';

import { UserRepository } from './user.repository.js';

import type { CreateUserData, UserResponse } from './user.types.js';

import { hashPassword } from '../../common/utils/password.js';

import { toUserResponse } from './user.mapper.js';

export interface IUserService {
  createUser(data: { name: string; email: string; password: string }): Promise<UserResponse>;

  getUserById(id: string): Promise<UserResponse | null>;
}

export class UserService implements IUserService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly unitOfWork: IUnitOfWork<PrismaTransactionClient>,
  ) {}

  public async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<UserResponse> {
    return this.unitOfWork.execute(async (transaction) => {
      const repository = new UserRepository(transaction);

      const existingUser = await repository.findByEmail(data.email);

      if (existingUser !== null) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          'A user with this email already exists.',
          HTTP_STATUS.CONFLICT,
        );
      }

      const passwordHash = await hashPassword(data.password);

      const createUserData: CreateUserData = {
        name: data.name,
        email: data.email,
        passwordHash,
      };

      const user = await repository.create(createUserData);

      return toUserResponse(user);
    });
  }

  public async getUserById(id: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);

    if (user === null) {
      return null;
    }

    return toUserResponse(user);
  }
}
