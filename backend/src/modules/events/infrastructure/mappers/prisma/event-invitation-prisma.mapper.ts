import { EventInvitation } from '../../../domain/entities/event-invitation.entity';

type PrismaEventInvitation = {
  id: string;
  eventId: string;
  invitedEmail: string;
  invitedByUserId: string;
  channel: 'EMAIL';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  tokenHash: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  deliveryFailedAt: Date | null;
  lastDeliveryError: string | null;
  createdAt: Date;
};

export class EventInvitationPrismaMapper {
  static toPersistence(invitation: EventInvitation) {
    const props = invitation.toPrimitives();

    return {
      eventId: props.eventId,
      invitedEmail: props.invitedEmail,
      invitedByUserId: props.invitedByUserId,
      channel: props.channel,
      status: props.status,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      acceptedAt: props.acceptedAt ?? null,
      revokedAt: props.revokedAt ?? null,
      deliveryFailedAt: props.deliveryFailedAt ?? null,
      lastDeliveryError: props.lastDeliveryError ?? null,
    };
  }

  static toDomain(row: PrismaEventInvitation): EventInvitation {
    return EventInvitation.rehydrate({
      id: row.id,
      eventId: row.eventId,
      invitedEmail: row.invitedEmail,
      invitedByUserId: row.invitedByUserId,
      channel: row.channel,
      status: row.status,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      acceptedAt: row.acceptedAt,
      revokedAt: row.revokedAt,
      deliveryFailedAt: row.deliveryFailedAt,
      lastDeliveryError: row.lastDeliveryError,
      createdAt: row.createdAt,
    });
  }
}
