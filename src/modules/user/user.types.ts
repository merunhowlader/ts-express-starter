export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}
