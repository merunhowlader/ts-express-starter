import { UserRole } from '../../generated/prisma/enums.js';

export interface AuthenticatedRequestUser {
  id: string;
  role: UserRole;
}
