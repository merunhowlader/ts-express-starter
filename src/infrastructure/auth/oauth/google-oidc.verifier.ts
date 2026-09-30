import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_ISSUER = 'https://accounts.google.com';

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

export interface GoogleIdTokenClaims {
  sub: string;
  email: string;
  name?: string;
  nonce?: string;
  email_verified?: boolean;
}

export class GoogleOidcVerifier {
  private readonly jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

  public constructor(private readonly clientId: string) {}

  public async verify(idToken: string, expectedNonce: string): Promise<GoogleIdTokenClaims> {
    const { payload } = await jwtVerify(idToken, this.jwks, {
      issuer: GOOGLE_ISSUER,
      audience: this.clientId,
    });

    if (
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      typeof payload.email !== 'string' ||
      payload.email.length === 0
    ) {
      throw new Error('Invalid Google ID token claims.');
    }

    if (payload.email_verified !== true) {
      throw new Error('Google email is not verified.');
    }

    if (payload.nonce !== expectedNonce) {
      throw new Error('Invalid Google ID token nonce.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      ...(typeof payload.name === 'string' ? { name: payload.name } : {}),
      ...(typeof payload.nonce === 'string' ? { nonce: payload.nonce } : {}),
      email_verified: true,
    };
  }
}
