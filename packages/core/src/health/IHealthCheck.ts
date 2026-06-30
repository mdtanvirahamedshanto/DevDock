export type HealthStatus = 'Healthy' | 'Degraded' | 'Unavailable' | 'Initializing';

export interface HealthCheckResult {
  status: HealthStatus;
  message?: string;
  timestamp: string;
}

export interface IHealthCheck {
  getHealth(): Promise<HealthCheckResult>;
}
