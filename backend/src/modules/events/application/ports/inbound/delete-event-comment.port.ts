export const DELETE_EVENT_COMMENT = Symbol('DELETE_EVENT_COMMENT');

export type DeleteEventCommentCommand = {
  userId: string;
  eventId: string;
  commentId: string;
};

export interface DeleteEventCommentPort {
  execute(command: DeleteEventCommentCommand): Promise<void>;
}
