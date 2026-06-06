import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  SessionRepositoryPort,
  SessionToCreate,
} from '../application/session-repository.port';

@Injectable()
export class SessionRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SessionToCreate) {
    return this.prisma.session.create({ data });
  }

  async findActiveByTokenHash(tokenHash: string) {
    return this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  async revoke(id: string) {
    return this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
