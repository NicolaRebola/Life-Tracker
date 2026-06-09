import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  ParticipantSessionRepositoryPort,
  ParticipantSessionWithParticipant,
} from '../../../domain';

@Injectable()
export class PrismaParticipantSessionRepository implements ParticipantSessionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    participantId,
    tokenHash,
    expiresAt,
  }: {
    participantId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string; expiresAt: Date }> {
    return this.prisma.participantSession.create({
      data: {
        participantId,
        tokenHash,
        expiresAt,
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });
  }

  async findActiveByTokenHash(
    tokenHash: string,
  ): Promise<ParticipantSessionWithParticipant | null> {
    const row = await this.prisma.participantSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        participant: {
          revokedAt: null,
          event: { deletedAt: null },
        },
      },
      include: {
        participant: {
          select: {
            id: true,
            eventId: true,
            email: true,
            displayName: true,
            revokedAt: true,
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      participant: row.participant,
    };
  }
}
