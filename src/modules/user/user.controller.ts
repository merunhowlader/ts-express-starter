import type { Request, Response } from 'express';

import type { CreateUserRequest } from './user.schema.js';
import type { IUserService } from './user.service.js';

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
    const id = Number(req.params.id);

    const user = await this.userService.getUserById(id);

    if (user === null) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found.',
          details: null,
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  };
}
