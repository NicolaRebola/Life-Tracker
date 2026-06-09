import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  EventParticipant,
  type AcceptInvitationResult,
  type EventInvitation,
  type EventInvitationListItem,
  type EventInvitationRepositoryPort,
} from '../../../domain';
import { EventInvitationPrismaMapper } from '../../mappers/prisma/event-invitation-prisma.mapper';

@Injectable()
export class PrismaEventInvitationRepository implements EventInvitationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitation: EventInvitation): Promise<EventInvitation> {
    const props = invitation.toPrimitives();
    const data = EventInvitationPrismaMapper.toPersistence(invitation);

    const row = props.id
      ? await this.prisma.eventInvitation.update({
          where: { id: props.id },
          data,
        })
      : await this.prisma.eventInvitation.create({ data });

    return EventInvitationPrismaMapper.toDomain(row);
  }

  async findByTokenHash(tokenHash: string): Promise<EventInvitation | null> {
    const row = await this.prisma.eventInvitation.findUnique({
      where: { tokenHash },
    });

    return row ? EventInvitationPrismaMapper.toDomain(row) : null;
  }

  async expirePendingForEmail(
    eventId: string,
    invitedEmail: string,
    now: Date,
  ): Promise<void> {
    await this.prisma.eventInvitation.updateMany({
      where: {
        eventId,
        invitedEmail,
        status: 'PENDING',
        expiresAt: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });
  }

  async acceptWithParticipant({
    invitation,
    participantDisplayName,
    participantUserId,
  }: {
    invitation: EventInvitation;
    participantDisplayName?: string | null;
    participantUserId?: string | null;
  }): Promise<AcceptInvitationResult> {
    const props = invitation.toPrimitives();

    if (!props.id) {
      throw new Error('Cannot accept invitation without id');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInvitation = await tx.eventInvitation.update({
        where: { id: props.id },
        data: {
          status: props.status,
          acceptedAt: props.acceptedAt,
        },
      });

      const participant = EventParticipant.create({
        eventId: props.eventId,
        email: props.invitedEmail,
        displayName: participantDisplayName,
        userId: participantUserId,
      });
      const participantProps = participant.toPrimitives();

      const savedParticipant = await tx.eventParticipant.upsert({
        where: {
          eventId_email: {
            eventId: participantProps.eventId,
            email: participantProps.email,
          },
        },
        update: {
          displayName: participantProps.displayName ?? null,
          userId: participantProps.userId ?? null,
          revokedAt: null,
        },
        create: {
          eventId: participantProps.eventId,
          email: participantProps.email,
          displayName: participantProps.displayName ?? null,
          userId: participantProps.userId ?? null,
        },
      });

      return {
        invitation: EventInvitationPrismaMapper.toDomain(updatedInvitation),
        participant: {
          id: savedParticipant.id,
          eventId: savedParticipant.eventId,
          email: savedParticipant.email,
          displayName: savedParticipant.displayName,
        },
      };
    });
  }

  async listByEventForOwner(
    ownerUserId: string,
    eventId: string,
  ): Promise<EventInvitationListItem[]> {
    return this.prisma.eventInvitation.findMany({
      where: {
        eventId,
        event: {
          userId: ownerUserId,
          deletedAt: null,
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        invitedEmail: true,
        channel: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        deliveryFailedAt: true,
        lastDeliveryError: true,
        createdAt: true,
      },
    });
  }
}
