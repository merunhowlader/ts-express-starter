import type { User, UserProfile } from '../../generated/prisma/client.js';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: { name: string; email: string; passwordHash: string }): Promise<User>;

  createProfile(data: {
    userId: number;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserProfile>;
}
