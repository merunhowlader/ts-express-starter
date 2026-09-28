import type { Request, Response } from 'express';

import {
  CSRF_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from '../../common/constants/auth.constants.js';

import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import type { IAuthService } from './auth.service.js';

import type { LoginCredentials } from './auth.types.js';

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
}
