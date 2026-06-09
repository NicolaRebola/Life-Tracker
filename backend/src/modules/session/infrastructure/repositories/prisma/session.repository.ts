import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { Session, SessionRepositoryPort } from '../../../domain';
import { SessionPrismaMapper } from '../../mappers/prisma/session-prisma.mapper';

@Injectable()
export class PrismaSessionRepository implements SessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: Session) {
    const savedSession = await this.prisma.session.create({
      data: SessionPrismaMapper.toPersistence(session),
    });

    return SessionPrismaMapper.toDomain(savedSession);
  }

  async findActiveByTokenHash(tokenHash: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    return session ? SessionPrismaMapper.toDomain(session) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
