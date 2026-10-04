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
  GoogleLoginStartResult,
  LoginCredentials,
  LoginResult,
  RefreshResult,
} from './auth.types.js';

import type { IUserRepository } from '../user/user.interface.js';
import { IOAuthProvider } from '../../infrastructure/auth/oauth/oauth-provider.interface.js';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthNonce,
  generateOAuthState,
} from '../../infrastructure/auth/oauth/oauth.utils.js';
import type { User } from '../../generated/prisma/client.js';
import { IUnitOfWork } from '../../common/interfaces/unit-of-work.interface.js';
import { PrismaDatabaseClient } from '../../infrastructure/database/prisma/prisma.types.js';
import { UserRepository } from '../user/user.repository.js';
import { AuthRepository } from './auth.repository.js';
import { OAuthStateStore } from '../../infrastructure/auth/oauth/oauth-state.store.js';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<LoginResult>;

  refresh(refreshToken: string): Promise<RefreshResult>;

  getCsrfToken(): Promise<CsrfResult>;

  logout(refreshToken: string): Promise<void>;
  startGoogleLogin(): Promise<GoogleLoginStartResult>;
  loginWithGoogle(code: string, state: string): Promise<LoginResult>;
}

// loginWithGoogle(code: string, codeVerifier: string): Promise<LoginResult>;

export class AuthService implements IAuthService {
  public constructor(
    private readonly userRepository: IUserRepository,
    private readonly authRepository: IAuthRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenExpiresIn: string,
    private readonly googleOAuthProvider: IOAuthProvider,
    private readonly unitOfWork: IUnitOfWork<PrismaDatabaseClient>,
    private readonly oauthStateStore: OAuthStateStore,
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

    if (user.passwordHash === null) {
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
  public async startGoogleLogin(): Promise<GoogleLoginStartResult> {
    const state = generateOAuthState();

    const codeVerifier = generateCodeVerifier();

    const codeChallenge = generateCodeChallenge(codeVerifier);

    const nonce = generateOAuthNonce();

    await this.oauthStateStore.save(
      state,
      {
        codeVerifier,
        nonce,
      },
      10 * 60,
    );

    const authorizationUrl = this.googleOAuthProvider.getAuthorizationUrl(
      state,
      codeChallenge,
      nonce,
    );

    return {
      authorizationUrl,
    };
  }
  public async loginWithGoogle(code: string, state: string): Promise<LoginResult> {
    const oauthState = await this.oauthStateStore.consume(state);

    if (oauthState === null) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid or expired OAuth state.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const profile = await this.googleOAuthProvider.exchangeCode(
      code,
      oauthState.codeVerifier,
      oauthState.nonce,
    );

    const existingOAuthAccount = await this.authRepository.findOAuthAccount(
      'google',
      profile.providerId,
    );

    let user: User;

    if (existingOAuthAccount !== null) {
      const existingUser = await this.userRepository.findById(existingOAuthAccount.userId);

      if (existingUser === null) {
        throw new AppError(
          ERROR_CODES.UNAUTHORIZED,
          'OAuth account is not linked to a valid user.',
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      user = existingUser;
    } else {
      const existingUser = await this.userRepository.findByEmail(profile.email);

      if (existingUser !== null) {
        await this.authRepository.createOAuthAccount({
          provider: 'google',
          providerAccountId: profile.providerId,
          userId: existingUser.id,
        });

        user = existingUser;
      } else {
        user = await this.unitOfWork.execute(async (transaction) => {
          const transactionUserRepository = new UserRepository(transaction);

          const transactionAuthRepository = new AuthRepository(transaction);

          const createdUser = await transactionUserRepository.create({
            name: profile.name,
            email: profile.email,
            passwordHash: null,
          });

          await transactionAuthRepository.createOAuthAccount({
            provider: 'google',
            providerAccountId: profile.providerId,
            userId: createdUser.id,
          });

          return createdUser;
        });
      }
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
}
