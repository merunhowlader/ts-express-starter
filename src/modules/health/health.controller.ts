import type { Request, Response } from 'express';
import { HealthServiceImpl } from './health.service.js';

import type { HealthResponse, HealthService } from './health.interface.js';

export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  public getHealth = (req: Request, res: Response<HealthResponse>): void => {
    const result = this.healthService.getHealth();
    res.status(200).json(result);
  };
}

export const healthController = new HealthController(new HealthServiceImpl());
