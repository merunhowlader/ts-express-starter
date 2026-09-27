import type { User } from '../../generated/prisma/client.js';

import type { UserResponse } from './user.types.js';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}
