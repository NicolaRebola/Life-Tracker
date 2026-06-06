import type { Event } from '../entities/event.entity';
import type { EventStatus } from '../entities/event-status';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export type ListEventsCriteria = {
  userId: string;
  name?: string;
  status?: EventStatus;
  tags?: string[];
  page: number;
  limit: number;
};

export type PaginatedEvents = {
  items: Event[];
  total: number;
};

export type EventTagSuggestion = {
  name: string;
  label: string;
};

export interface EventRepositoryPort {
  save(event: Event): Promise<Event>;
  findMany(criteria: ListEventsCriteria): Promise<PaginatedEvents>;
  searchTagsByName(
    userId: string,
    name: string,
    limit: number,
  ): Promise<EventTagSuggestion[]>;
  updateStatus(
    userId: string,
    eventId: string,
    status: EventStatus,
  ): Promise<Event | null>;
}
