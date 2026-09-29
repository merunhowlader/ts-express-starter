import type { User, UserProfile } from '../../generated/prisma/client.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: { name: string; email: string; passwordHash: string | null }): Promise<User>;

  createProfile(data: {
    userId: string;
    bio?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserProfile>;
}
