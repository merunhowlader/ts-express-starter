import type { User } from '../../generated/prisma/client.js';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(data: { name: string; email: string; passwordHash: string }): Promise<User>;
}
