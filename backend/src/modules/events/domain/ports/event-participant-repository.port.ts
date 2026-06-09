import type { EventParticipant } from '../entities/event-participant.entity';

export const EVENT_PARTICIPANT_REPOSITORY = Symbol(
  'EVENT_PARTICIPANT_REPOSITORY',
);

export type EventParticipantListItem = {
  id: string;
  eventId: string;
  email: string;
  displayName: string | null;
  userId: string | null;
  joinedAt: Date;
  revokedAt: Date | null;
};

export interface EventParticipantRepositoryPort {
  findActiveById(
    participantId: string,
  ): Promise<EventParticipantListItem | null>;
  findActiveByEventAndEmail(
    eventId: string,
    email: string,
  ): Promise<EventParticipantListItem | null>;
  listByEventForOwner(
    ownerUserId: string,
    eventId: string,
  ): Promise<EventParticipantListItem[]>;
  upsertAccepted(
    participant: EventParticipant,
  ): Promise<EventParticipantListItem>;
  softRevoke(
    ownerUserId: string,
    eventId: string,
    participantId: string,
    revokedAt: Date,
  ): Promise<boolean>;
}
