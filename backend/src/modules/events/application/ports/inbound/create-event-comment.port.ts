import type { EventCommentListItem } from './list-event-comments.port';

export const CREATE_EVENT_COMMENT = Symbol('CREATE_EVENT_COMMENT');

export type CreateEventCommentCommand = {
  userId: string;
  eventId: string;
  body: string;
};

export type CreateEventCommentResult = {
  comment: EventCommentListItem;
};

export interface CreateEventCommentPort {
  execute(command: CreateEventCommentCommand): Promise<CreateEventCommentResult>;
}
