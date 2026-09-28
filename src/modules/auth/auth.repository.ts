import type { RefreshToken } from '../../generated/prisma/client.js';

import type { PrismaDatabaseClient } from '../../infrastructure/database/prisma/prisma.types.js';

import type { IAuthRepository } from './auth.interface.js';

export class AuthRepository implements IAuthRepository {
  public constructor(private readonly db: PrismaDatabaseClient) {}

  public async createRefreshToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.db.refreshToken.create({
      data,
    });
  }

  public async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });
  }

  public async revokeRefreshToken(id: string): Promise<void> {
    await this.db.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export const createAuthRepository = (db: PrismaDatabaseClient): IAuthRepository => {
  return new AuthRepository(db);
};
