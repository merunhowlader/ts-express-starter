export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface HealthService {
  getHealth(): HealthResponse;
}
