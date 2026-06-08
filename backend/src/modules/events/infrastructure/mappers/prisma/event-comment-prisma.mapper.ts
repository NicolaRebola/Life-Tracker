import { EventComment } from '../../../domain/entities/event-comment.entity';
import type { EventCommentWithAuthor } from '../../../domain/ports/event-comment-repository.port';

type PrismaEventCommentWithUser = {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    displayName: string | null;
    email: string;
  };
};

export class EventCommentPrismaMapper {
  static toPersistence(comment: EventComment) {
    const props = comment.toPrimitives();

    return {
      eventId: props.eventId,
      userId: props.userId,
      body: props.body,
    };
  }

  static toDomain(row: PrismaEventCommentWithUser): EventComment {
    return EventComment.rehydrate({
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }

  static toWithAuthor(row: PrismaEventCommentWithUser): EventCommentWithAuthor {
    return {
      id: row.id,
      eventId: row.eventId,
      userId: row.userId,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.user.id,
        displayName: row.user.displayName,
        email: row.user.email,
      },
    };
  }
}
