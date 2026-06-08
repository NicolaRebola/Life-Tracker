export const LIST_EVENT_COMMENTS = Symbol('LIST_EVENT_COMMENTS');

export type EventCommentListItem = {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
  author: {
    id: string;
    displayName: string | null;
    email: string;
  };
};

export type ListEventCommentsCommand = {
  userId: string;
  eventId: string;
};

export type ListEventCommentsResult = {
  items: EventCommentListItem[];
};

export interface ListEventCommentsPort {
  execute(command: ListEventCommentsCommand): Promise<ListEventCommentsResult>;
}
