import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import { AppError } from '../../common/errors/app.error.js';

import { ERROR_CODES } from '../../common/errors/error.codes.js';

import type { ITokenService } from '../../common/interfaces/token.interface.js';

import { generateCsrfToken } from '../../common/utils/csrf.js';

import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
} from '../../common/utils/refresh-token.js';

import { verifyPassword } from '../../common/utils/password.js';

import type { IAuthRepository } from './auth.interface.js';

import type {
  AuthenticatedUser,
  CsrfResult,
  LoginCredentials,
  LoginResult,
  RefreshResult,
} from './auth.types.js';

import type { IUserRepository } from '../user/user.interface.js';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;

  refresh(refreshToken: string): Promise<RefreshResult>;

  getCsrfToken(): Promise<CsrfResult>;

  logout(refreshToken: string): Promise<void>;
}

export class AuthService implements IAuthService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenExpiresIn: string,
  ) {}

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

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      type: 'access',
    });

    const refreshToken = generateRefreshToken();

    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = getRefreshTokenExpiry(this.refreshTokenExpiresIn);

    await this.authRepository.createRefreshToken({
      tokenHash,
      userId: user.id,
      expiresAt,
    });

    return {
      user: authenticatedUser,
      accessToken,
      refreshToken,
    };
  }

  public async refresh(refreshToken: string): Promise<RefreshResult> {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await this.authRepository.findRefreshToken(tokenHash);

    if (storedToken === null) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid refresh token.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (storedToken.revokedAt !== null) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Refresh token has already been revoked.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Refresh token has expired.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const user = await this.userRepository.findById(storedToken.userId);

    if (user === null) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'User account was not found.',
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

    const accessToken = this.tokenService.generateAccessToken({
      sub: String(user.id),
      role: user.role,
      type: 'access',
    });

    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashRefreshToken(newRefreshToken);

    const newExpiresAt = getRefreshTokenExpiry(this.refreshTokenExpiresIn);

    await this.authRepository.revokeRefreshToken(storedToken.id);

    await this.authRepository.createRefreshToken({
      tokenHash: newTokenHash,
      userId: user.id,
      expiresAt: newExpiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async getCsrfToken(): Promise<CsrfResult> {
    return {
      csrfToken: generateCsrfToken(),
    };
  }

  public async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await this.authRepository.findRefreshToken(tokenHash);

    if (storedToken === null) {
      return;
    }

    if (storedToken.revokedAt !== null) {
      return;
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);
  }
}
