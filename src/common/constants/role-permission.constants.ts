import type { UserRole } from '../../generated/prisma/client.js';

import { PERMISSIONS, type Permission } from './permission.constants.js';

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  USER: [PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE],

  MODERATOR: [PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_MODERATE],

  ADMIN: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MODERATE,
  ],
};
