import { Controller, Get, Inject } from '@nestjs/common';
import {
  CHECK_DB_HEALTH,
  type CheckDbHealthPort,
} from '../../application/check-db-health.port';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(CHECK_DB_HEALTH)
    private readonly checkDbHealthUseCase: CheckDbHealthPort,
  ) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'life-tracker-api',
    };
  }

  @Get('db')
  getHealthDb() {
    return this.checkDbHealthUseCase.execute();
  }
}
