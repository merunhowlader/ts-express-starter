export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface ITokenService {
  generateAccessToken(
    payload: AccessTokenPayload,
  ): string;

  verifyAccessToken(
    token: string,
  ): AccessTokenPayload;
}