import type { EventCommentListItem } from './list-event-comments.port';

export const UPDATE_EVENT_COMMENT = Symbol('UPDATE_EVENT_COMMENT');

export type UpdateEventCommentCommand = {
  userId: string;
  eventId: string;
  commentId: string;
  body: string;
};

export type UpdateEventCommentResult = {
  comment: EventCommentListItem;
};

export interface UpdateEventCommentPort {
  execute(
    command: UpdateEventCommentCommand,
  ): Promise<UpdateEventCommentResult>;
}
