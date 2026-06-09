import type { EventComment } from '../entities/event-comment.entity';

export const EVENT_COMMENT_REPOSITORY = Symbol('EVENT_COMMENT_REPOSITORY');

export type EventCommentAuthor = {
  kind: 'USER' | 'PARTICIPANT';
  id: string;
  displayName: string | null;
  email: string;
};

export type EventCommentWithAuthor = {
  id: string;
  eventId: string;
  userId: string | null;
  participantId: string | null;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: EventCommentAuthor;
};

export interface EventCommentRepositoryPort {
  save(comment: EventComment): Promise<EventCommentWithAuthor>;
  findManyByEventForUser(
    userId: string,
    eventId: string,
  ): Promise<EventCommentWithAuthor[]>;
  findManyByEventForParticipant(
    participantId: string,
    eventId: string,
  ): Promise<EventCommentWithAuthor[]>;
  findByIdForUser(
    userId: string,
    eventId: string,
    commentId: string,
  ): Promise<EventCommentWithAuthor | null>;
  findByIdForParticipant(
    participantId: string,
    eventId: string,
    commentId: string,
  ): Promise<EventCommentWithAuthor | null>;
  update(comment: EventComment): Promise<EventCommentWithAuthor>;
  softDelete(
    userId: string,
    eventId: string,
    commentId: string,
    deletedAt: Date,
  ): Promise<boolean>;
  countByEventIds(eventIds: string[]): Promise<Record<string, number>>;
}
