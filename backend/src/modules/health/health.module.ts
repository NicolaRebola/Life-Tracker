import { Module } from '@nestjs/common';
import { HealthController } from './delivery/http/health.controller';
import { CheckDbHealthUseCase } from './application/check-db-health.use-case';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [CheckDbHealthUseCase],
})
export class HealthModule {}
