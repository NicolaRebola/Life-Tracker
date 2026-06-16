
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  EventParticipant,
  EventParticipantListItem,
  EventParticipantRepositoryPort,
} from '../../../domain';
import { EventParticipantPrismaMapper } from '../../mappers/prisma/event-participant-prisma.mapper';

@Injectable()
export class PrismaEventParticipantRepository implements EventParticipantRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveById(
    participantId: string,
  ): Promise<EventParticipantListItem | null> {
    const row = await this.prisma.eventParticipant.findFirst({
      where: {
        id: participantId,
        revokedAt: null,
        event: { deletedAt: null },
      },
    });

    return row;
  }

  async findActiveByEventAndEmail(
    eventId: string,
    email: string,
  ): Promise<EventParticipantListItem | null> {
    const row = await this.prisma.eventParticipant.findFirst({
      where: {
        eventId,
        email: {
          equals: email,
          mode: 'insensitive',
        },
        revokedAt: null,
        event: { deletedAt: null },
      },
    });

    return row;
  }

  async listByEventForOwner(
    ownerUserId: string,
    eventId: string,
  ): Promise<EventParticipantListItem[]> {
    return this.prisma.eventParticipant.findMany({
      where: {
        eventId,
        event: {
          userId: ownerUserId,
          deletedAt: null,
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async upsertAccepted(
    participant: EventParticipant,
  ): Promise<EventParticipantListItem> {
    const props = participant.toPrimitives();

    return this.prisma.eventParticipant.upsert({
      where: {
        eventId_email: {
          eventId: props.eventId,
          email: props.email,
        },
      },
      update: {
        displayName: props.displayName ?? null,
        userId: props.userId ?? null,
        revokedAt: null,
      },
      create: EventParticipantPrismaMapper.toPersistence(participant),
    });
  }

  async softRevoke(
    ownerUserId: string,
    eventId: string,
    participantId: string,
    revokedAt: Date,
  ): Promise<boolean> {
    const { count } = await this.prisma.eventParticipant.updateMany({
      where: {
        id: participantId,
        eventId,
        revokedAt: null,
        event: {
          userId: ownerUserId,
          deletedAt: null,
        },
      },
      data: { revokedAt },
    });

    return count > 0;
  }
}
