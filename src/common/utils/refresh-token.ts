import { createHash, randomBytes } from 'node:crypto';

type RefreshTokenTimeUnit = 's' | 'm' | 'h' | 'd';

const millisecondsPerUnit: Record<RefreshTokenTimeUnit, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(expiresIn: string): Date {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);

  if (match === null) {
    throw new Error('Invalid refresh token expiration format.');
  }

  const amount = Number(match[1]);
  const unit = match[2] as RefreshTokenTimeUnit;

  return new Date(Date.now() + amount * millisecondsPerUnit[unit]);
}
