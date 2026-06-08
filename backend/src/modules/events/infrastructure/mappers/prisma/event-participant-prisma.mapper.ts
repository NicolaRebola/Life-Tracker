import { EventParticipant } from '../../../domain/entities/event-participant.entity';

type PrismaEventParticipant = {
  id: string;
  eventId: string;
  email: string;
  displayName: string | null;
  userId: string | null;
  joinedAt: Date;
  revokedAt: Date | null;
};

export class EventParticipantPrismaMapper {
  static toPersistence(participant: EventParticipant) {
    const props = participant.toPrimitives();

    return {
      eventId: props.eventId,
      email: props.email,
      displayName: props.displayName ?? null,
      userId: props.userId ?? null,
      joinedAt: props.joinedAt,
      revokedAt: props.revokedAt ?? null,
    };
  }

  static toDomain(row: PrismaEventParticipant): EventParticipant {
    return EventParticipant.rehydrate({
      id: row.id,
      eventId: row.eventId,
      email: row.email,
      displayName: row.displayName,
      userId: row.userId,
      joinedAt: row.joinedAt,
      revokedAt: row.revokedAt,
    });
  }
}
