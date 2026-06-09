import { Module } from '@nestjs/common';
import { HealthController } from './delivery/http/health.controller';
import { CheckDbHealthUseCase } from './application/check-db-health.use-case';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CHECK_DB_HEALTH } from './application/check-db-health.port';
import { DB_HEALTH_CHECKER } from './application/db-health-checker.port';
import { PrismaDbHealthChecker } from './infrastructure/prisma-db-health-checker';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    CheckDbHealthUseCase,
    PrismaDbHealthChecker,
    { provide: CHECK_DB_HEALTH, useExisting: CheckDbHealthUseCase },
    { provide: DB_HEALTH_CHECKER, useExisting: PrismaDbHealthChecker },
  ],
})
export class HealthModule {}
