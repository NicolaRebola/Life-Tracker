import { Controller, Get } from '@nestjs/common';
import { CheckDbHealthUseCase } from '../../application/check-db-health.use-case';

@Controller('health')
export class HealthController {
  constructor(private readonly checkDbHealthUseCase: CheckDbHealthUseCase) {}

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
