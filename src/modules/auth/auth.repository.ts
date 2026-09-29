import type { OAuthAccount, RefreshToken } from '../../generated/prisma/client.js';

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

  public async findOAuthAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<OAuthAccount | null> {
    return this.db.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });
  }

  public async createOAuthAccount(data: {
    provider: string;
    providerAccountId: string;
    userId: string;
  }): Promise<OAuthAccount> {
    return this.db.oAuthAccount.create({
      data,
    });
  }
}

export const createAuthRepository = (db: PrismaDatabaseClient): IAuthRepository => {
  return new AuthRepository(db);
};
