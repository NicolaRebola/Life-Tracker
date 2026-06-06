import { CreateEventUseCase } from './use-cases/create-event-use-case';
import { ListEventsUseCase } from './use-cases/list-events-use-case';
import { SearchEventTagsUseCase } from './use-cases/search-event-tags-use-case';
import { UpdateEventStatusUseCase } from './use-cases/update-event-status-use-case';

export * from './ports/inbound/create-event.port';
export * from './ports/inbound/list-events.port';
export * from './ports/inbound/search-event-tags.port';
export * from './ports/inbound/update-event-status.port';

export const USE_CASES = [
  CreateEventUseCase,
  ListEventsUseCase,
  SearchEventTagsUseCase,
  UpdateEventStatusUseCase,
];
