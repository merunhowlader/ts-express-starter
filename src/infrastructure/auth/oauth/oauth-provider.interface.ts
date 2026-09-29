export interface OAuthUserProfile {
  providerId: string;
  email: string;
  name: string;
}

export interface IOAuthProvider {
  getAuthorizationUrl(state: string, codeChallenge: string): string;

  exchangeCode(code: string, codeVerifier: string): Promise<OAuthUserProfile>;
}
