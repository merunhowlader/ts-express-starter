import type { HealthResponse, HealthService } from './health.interface.js';

export class HealthServiceImpl implements HealthService {
  public getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
