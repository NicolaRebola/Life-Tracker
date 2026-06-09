import type { EventCommentWithAuthor } from '../../domain/ports/event-comment-repository.port';
import type { EventCommentListItem } from '../ports/inbound/list-event-comments.port';
import { isSameEventActor, type EventActor } from '../../domain';

export function toEventCommentListItem(
  comment: EventCommentWithAuthor,
  currentActor: EventActor,
): EventCommentListItem {
  return {
    id: comment.id,
    eventId: comment.eventId,
    userId: comment.userId,
    participantId: comment.participantId,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    isOwn: isSameEventActor(currentActor, comment),
    author: comment.author,
  };
}
