import jwt, { type SignOptions } from 'jsonwebtoken';

import type { AccessTokenPayload, ITokenService } from '../../common/interfaces/token.interface.js';

export class JwtTokenService implements ITokenService {
  public constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  public generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as NonNullable<SignOptions['expiresIn']>,
    });
  }

  public verifyAccessToken(token: string): AccessTokenPayload {
    const payload = jwt.verify(token, this.secret);

    if (
      typeof payload !== 'object' ||
      payload === null ||
      payload.type !== 'access' ||
      typeof payload.sub !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      throw new Error('Invalid access token payload.');
    }

    return {
      sub: payload.sub,
      role: payload.role,
      type: 'access',
    };
  }
}
