import type { IOAuthProvider, OAuthUserProfile } from './oauth-provider.interface.js';

export class GoogleOAuthProvider implements IOAuthProvider {
  public constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  public getAuthorizationUrl(
    state: string,
    codeChallenge: string,
  ): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async exchangeCode(
    code: string,
    codeVerifier: string,
  ): Promise<OAuthUserProfile> {
    const tokenResponse = await fetch(
      'https://oauth2.googleapis.com/token',
      {
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
      },
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange Google authorization code.');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
    };

    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!profileResponse.ok) {
      throw new Error('Failed to retrieve Google user profile.');
    }

    const profile = (await profileResponse.json()) as {
      id: string;
      email: string;
      name: string;
    };

    return {
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
    };
  }
}