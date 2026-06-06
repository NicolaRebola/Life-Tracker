import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { DbHealthCheckerPort } from '../application/db-health-checker.port';

@Injectable()
export class PrismaDbHealthChecker implements DbHealthCheckerPort {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
