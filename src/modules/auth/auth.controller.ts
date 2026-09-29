import type { Request, Response } from 'express';

import {
  CSRF_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_PATH,
  OAUTH_COOKIE_NAMES,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from '../../common/constants/auth.constants.js';

import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import type { IAuthService } from './auth.service.js';

import type { LoginCredentials } from './auth.types.js';
import { ERROR_CODES } from '../../common/errors/error.codes.js';
import { AppError } from '../../common/errors/app.error.js';

export class AuthController {
  public constructor(
    private readonly authService: IAuthService,
    private readonly isProduction: boolean,
  ) {}

  public login = async (req: Request, res: Response): Promise<void> => {
    const credentials = req.body as LoginCredentials;

    const result = await this.authService.login(credentials);

    this.setRefreshTokenCookie(res, result.refreshToken);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (typeof refreshToken !== 'string') {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Refresh token is required.',
        },
      });

      return;
    }

    const result = await this.authService.refresh(refreshToken);

    this.setRefreshTokenCookie(res, result.refreshToken);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  };

  public getCsrf = async (_req: Request, res: Response): Promise<void> => {
    const result = await this.authService.getCsrfToken();

    res.cookie(CSRF_TOKEN_COOKIE_NAME, result.csrfToken, {
      httpOnly: false,
      secure: this.isProduction,
      sameSite: 'lax',
      path: CSRF_TOKEN_COOKIE_PATH,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (typeof refreshToken === 'string') {
      await this.authService.logout(refreshToken);
    }

    this.clearRefreshTokenCookie(res);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: null,
    });
  };

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
    });
  }

  public googleLogin = (_req: Request, res: Response): void => {
    const result = this.authService.startGoogleLogin();

    res
      .cookie(OAUTH_COOKIE_NAMES.state, result.state, {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/api/v1/auth',
      })
      .cookie(OAUTH_COOKIE_NAMES.codeVerifier, result.codeVerifier, {
        httpOnly: true,
        secure: this.isProduction,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/api/v1/auth',
      })
      .redirect(result.authorizationUrl);
  };

  public googleCallback = async (req: Request, res: Response): Promise<void> => {
    const code = req.query.code;
    const state = req.query.state;

    const savedState = req.cookies[OAUTH_COOKIE_NAMES.state];

    const codeVerifier = req.cookies[OAUTH_COOKIE_NAMES.codeVerifier];

    if (
      typeof code !== 'string' ||
      typeof state !== 'string' ||
      typeof savedState !== 'string' ||
      typeof codeVerifier !== 'string'
    ) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid OAuth callback.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (state !== savedState) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Invalid OAuth state.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const result = await this.authService.loginWithGoogle(code, codeVerifier);

    res.clearCookie(OAUTH_COOKIE_NAMES.state, {
      path: '/api/v1/auth',
    });

    res.clearCookie(OAUTH_COOKIE_NAMES.codeVerifier, {
      path: '/api/v1/auth',
    });

    res.json(result);
  };
}
