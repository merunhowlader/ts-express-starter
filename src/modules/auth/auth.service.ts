import { HTTP_STATUS } from '../../common/constants/http.constants.js';
import { AppError } from '../../common/errors/app.error.js';
import { ERROR_CODES } from '../../common/errors/error.codes.js';
import { verifyPassword } from '../../common/utils/password.js';

import type { IUserRepository } from '../user/user.interface.js';

import type { AuthenticatedUser, LoginCredentials, LoginResult } from './auth.types.js';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;
}

export class AuthService implements IAuthService {
  public constructor(private readonly userRepository: IUserRepository) {}

  public async login(credentials: LoginCredentials): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (user === null) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid email or password.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const passwordValid = await verifyPassword(credentials.password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid email or password.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        'User account is not active.',
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    return {
      user: authenticatedUser,
    };
  }
}
