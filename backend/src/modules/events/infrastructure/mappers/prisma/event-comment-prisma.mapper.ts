import { EventComment } from '../../../domain/entities/event-comment.entity';
import type { EventCommentWithAuthor } from '../../../domain/ports/event-comment-repository.port';

type PrismaEventCommentWithUser = {
  id: string;
  eventId: string;
  userId: string | null;
  participantId: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
  participant: {
    id: string;
    displayName: string | null;
    email: string;
  } | null;
};

export class EventCommentPrismaMapper {
  static toPersistence(comment: EventComment) {
    const props = comment.toPrimitives();

    return {
      eventId: props.eventId,
      userId: props.userId ?? null,
      participantId: props.participantId ?? null,
      body: props.body,
    };
  }

  static toDomain(row: PrismaEventCommentWithUser): EventComment {
    return EventComment.rehydrate({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      participantId: row.participantId,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  static toWithAuthor(row: PrismaEventCommentWithUser): EventCommentWithAuthor {
    const author = row.user
      ? {
          kind: 'USER' as const,
          id: row.user.id,
          displayName: row.user.displayName,
          email: row.user.email,
        }
      : {
          kind: 'PARTICIPANT' as const,
          id: row.participant!.id,
          displayName: row.participant!.displayName,
          email: row.participant!.email,
        };

    return {
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      participantId: row.participantId,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author,
    };
  }
}
