import { Inject, Injectable } from '@nestjs/common';
import {
  DB_HEALTH_CHECKER,
  type DbHealthCheckerPort,
} from './db-health-checker.port';
import type { CheckDbHealthPort, DbHealthResult } from './check-db-health.port';

@Injectable()
export class CheckDbHealthUseCase implements CheckDbHealthPort {
  constructor(
    @Inject(DB_HEALTH_CHECKER)
    private readonly dbHealthChecker: DbHealthCheckerPort,
  ) {}

  async execute(): Promise<DbHealthResult> {
    const startedAt = Date.now();

    await this.dbHealthChecker.ping();

    return {
      status: 'ok',
      database: 'ok',
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      service: 'life-tracker-api',
    };
  }
}
