import type { Request, Response } from 'express';

import { HTTP_STATUS } from '../../common/constants/http.constants.js';

import type { LoginRequest } from './auth.schema.js';
import type { IAuthService } from './auth.service.js';

export class AuthController {
  public constructor(
    private readonly authService: IAuthService,
  ) {}

  public login = async (
    req: Request<
      Record<string, never>,
      unknown,
      LoginRequest['body']
    >,
    res: Response,
  ): Promise<void> => {
    const result =
      await this.authService.login(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };
}