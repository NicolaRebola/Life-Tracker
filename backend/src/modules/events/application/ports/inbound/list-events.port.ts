import type { EventStatus } from '../../../domain/entities/event-status';

export const LIST_EVENTS = Symbol('LIST_EVENTS');

export type ListEventsCommand = {
  userId: string;
  name?: string;
  status?: EventStatus;
  tags?: string[];
  page?: number;
  limit?: number;
};

export type EventListItem = {
  id: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: string;
  toDateTime: string;
  status: EventStatus;
  tags: Array<{ name: string; label: string }>;
};

export type ListEventsResult = {
  items: EventListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export interface ListEventsPort {
  execute(command: ListEventsCommand): Promise<ListEventsResult>;
}
