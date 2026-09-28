export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface LoginResult {
  user: AuthenticatedUser;
}
