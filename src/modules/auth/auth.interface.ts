import type { RefreshToken } from '../../generated/prisma/client.js';

export interface IAuthRepository {
  createRefreshToken(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;

  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;

  revokeRefreshToken(id: string): Promise<void>;
}
