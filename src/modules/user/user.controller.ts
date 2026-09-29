import type { Request, Response } from 'express';

import type { CreateUserRequest } from './user.schema.js';
import type { IUserService } from './user.service.js';
import { AppError } from '../../common/errors/app.error.js';
import { ERROR_CODES } from '../../common/errors/error.codes.js';
import { HTTP_STATUS } from '../../common/constants/http.constants.js';

export class UserController {
  public constructor(private readonly userService: IUserService) {}

  public createUser = async (
    req: Request<Record<string, never>, unknown, CreateUserRequest['body']>,
    res: Response,
  ): Promise<void> => {
    const user = await this.userService.createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  };

  public getUserById = async (
    req: Request<{
      id: string;
    }>,
    res: Response,
  ): Promise<void> => {
    const user = req.user;

    if (user === undefined) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication is required.',
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const result = await this.userService.getUserById(req.params.id, user);

    if (result === null) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 'User not found.', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };
}
