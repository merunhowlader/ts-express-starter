export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface CsrfResult {
  csrfToken: string;
}
