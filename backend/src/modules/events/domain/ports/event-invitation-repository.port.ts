import type { EventInvitation } from '../entities/event-invitation.entity';

export const EVENT_INVITATION_REPOSITORY = Symbol(
  'EVENT_INVITATION_REPOSITORY',
);

export type EventInvitationListItem = {
  id: string;
  eventId: string;
  invitedEmail: string;
  channel: 'EMAIL';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date;
  acceptedAt: Date | null;
  deliveryFailedAt: Date | null;
  lastDeliveryError: string | null;
  createdAt: Date;
};

export type AcceptInvitationResult = {
  invitation: EventInvitation;
  participant: {
    id: string;
    eventId: string;
    email: string;
    displayName: string | null;
  };
};

export interface EventInvitationRepositoryPort {
  save(invitation: EventInvitation): Promise<EventInvitation>;
  findByTokenHash(tokenHash: string): Promise<EventInvitation | null>;
  expirePendingForEmail(
    eventId: string,
    invitedEmail: string,
    now: Date,
  ): Promise<void>;
  acceptWithParticipant(command: {
    invitation: EventInvitation;
    participantDisplayName?: string | null;
    participantUserId?: string | null;
  }): Promise<AcceptInvitationResult>;
  listByEventForOwner(
    ownerUserId: string,
    eventId: string,
  ): Promise<EventInvitationListItem[]>;
}
