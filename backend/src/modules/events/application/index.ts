import { CreateEventCommentUseCase } from './use-cases/create-event-comment-use-case';
import { CreateEventUseCase } from './use-cases/create-event-use-case';
import { DeleteEventCommentUseCase } from './use-cases/delete-event-comment-use-case';
import { DeleteEventUseCase } from './use-cases/delete-event-use-case';
import { ListEventCommentsUseCase } from './use-cases/list-event-comments-use-case';
import { ListEventsUseCase } from './use-cases/list-events-use-case';
import { PurgeDeletedEventsUseCase } from './use-cases/purge-deleted-events-use-case';
import { SearchEventTagsUseCase } from './use-cases/search-event-tags-use-case';
import { UpdateEventCommentUseCase } from './use-cases/update-event-comment-use-case';
import { UpdateEventUseCase } from './use-cases/update-event-use-case';
import { UpdateEventStatusUseCase } from './use-cases/update-event-status-use-case';

export * from './ports/inbound/create-event-comment.port';
export * from './ports/inbound/create-event.port';
export * from './ports/inbound/delete-event-comment.port';
export * from './ports/inbound/delete-event.port';
export * from './ports/inbound/list-event-comments.port';
export * from './ports/inbound/list-events.port';
export * from './ports/inbound/purge-deleted-events.port';
export * from './ports/inbound/search-event-tags.port';
export * from './ports/inbound/update-event-comment.port';
export * from './ports/inbound/update-event-status.port';
export * from './ports/inbound/update-event.port';

export const USE_CASES = [
  CreateEventCommentUseCase,
  CreateEventUseCase,
  DeleteEventCommentUseCase,
  DeleteEventUseCase,
  ListEventCommentsUseCase,
  ListEventsUseCase,
  PurgeDeletedEventsUseCase,
  SearchEventTagsUseCase,
  UpdateEventCommentUseCase,
  UpdateEventStatusUseCase,
  UpdateEventUseCase,
];
