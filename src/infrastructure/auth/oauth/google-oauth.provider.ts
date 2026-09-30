import type { GoogleOidcVerifier } from './google-oidc.verifier.js';

import type { IOAuthProvider, OAuthUserProfile } from './oauth-provider.interface.js';

export class GoogleOAuthProvider implements IOAuthProvider {
  public constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
    private readonly googleOidcVerifier: GoogleOidcVerifier,
  ) {}

  public getAuthorizationUrl(state: string, codeChallenge: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async exchangeCode(
    code: string,
    codeVerifier: string,
    nonce: string,
  ): Promise<OAuthUserProfile> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange Google authorization code.');
    }

    const tokenData = (await tokenResponse.json()) as {
      id_token: string;
    };

    const claims = await this.googleOidcVerifier.verify(tokenData.id_token, nonce);

    return {
      providerId: claims.sub,
      email: claims.email,
      name: claims.name ?? claims.email,
    };
  }
}
