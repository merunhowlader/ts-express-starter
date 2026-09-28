import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import type { LoginRequest } from './auth.schema.js';

import type { IAuthService } from './auth.service.js';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from '../../common/constants/auth.constants.js';
import { AppError } from '../../common/errors/app.error.js';
import { ERROR_CODES } from '../../common/errors/error.codes.js';

import {
  CSRF_TOKEN_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_PATH,
} from '../../common/constants/auth.constants.js';

export class AuthController {
  public constructor(
    private readonly authService: IAuthService,
    private readonly isProduction: boolean,
  ) {}

  public login = async (
    req: Request<Record<string, never>, unknown, LoginRequest['body']>,
    res: Response,
  ): Promise<void> => {
    const result = await this.authService.login(req.body);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
    });

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

    if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Refresh token is required.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const result = await this.authService.refresh(refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: REFRESH_TOKEN_COOKIE_PATH,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  };
  public getCsrf = async (_req: Request, res: Response): Promise<void> => {
    console.log('hhhhhhhhhhhhhhhhhhhhhhhhhh');
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
}
