import type { User, UserProfile } from '../../generated/prisma/client.js';

import type { PrismaDatabaseClient } from '../../infrastructure/database/prisma/prisma.types.js';

import type { IUserRepository } from './user.interface.js';

export class UserRepository implements IUserRepository {
  public constructor(private readonly db: PrismaDatabaseClient) {}

  public async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  public async create(data: {
    name: string;
    email: string;
    passwordHash: string | null;
  }): Promise<User> {
    return this.db.user.create({
      data,
    });
  }

  public async createProfile(data: {
    userId: string;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserProfile> {
    return this.db.userProfile.create({
      data,
    });
  }
}

export const createUserRepository = (db: PrismaDatabaseClient): IUserRepository => {
  return new UserRepository(db);
};
