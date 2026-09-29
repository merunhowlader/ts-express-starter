export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const REFRESH_TOKEN_COOKIE_PATH = '/api/v1/auth';

export const CSRF_TOKEN_COOKIE_NAME = 'csrfToken';

export const CSRF_TOKEN_COOKIE_PATH = '/api/v1/auth';

export const CSRF_TOKEN_HEADER = 'x-csrf-token';

export const OAUTH_COOKIE_NAMES = {
  state: 'oauth_state',
  codeVerifier: 'oauth_code_verifier',
} as const;
