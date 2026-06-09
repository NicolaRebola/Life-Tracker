import type { Event } from '../entities/event.entity';
import type { EventStatus } from '../entities/event-status';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export type ListEventsCriteria = {
  userId: string;
  name?: string;
  status?: EventStatus;
  tags?: string[];
  rangeStart?: Date;
  rangeEnd?: Date;
  page: number;
  limit: number;
};

export type PaginatedEventItem = {
  event: Event;
  commentCount: number;
  participantCount: number;
  creator: {
    id: string;
    displayName: string | null;
    email: string;
  };
};

export type PaginatedEvents = {
  items: PaginatedEventItem[];
  total: number;
};

export type EventTagSuggestion = {
  name: string;
  label: string;
};

export type ApplyStatusTransitionCommand = {
  userId: string;
  eventId: string;
  fromStatus: EventStatus;
  toStatus: EventStatus;
};

export type EventStatusTransitionWriteResult = {
  event: Event;
  applied: boolean;
};

export interface EventRepositoryPort {
  save(event: Event): Promise<Event>;
  update(event: Event): Promise<Event>;
  findMany(criteria: ListEventsCriteria): Promise<PaginatedEvents>;
  findByIdForUser(userId: string, eventId: string): Promise<Event | null>;
  findByIdForOwner(userId: string, eventId: string): Promise<Event | null>;
  findByIdForParticipant(
    participantId: string,
    eventId: string,
  ): Promise<Event | null>;
  searchTagsByName(
    userId: string,
    name: string,
    limit: number,
  ): Promise<EventTagSuggestion[]>;
  applyStatusTransition(
    command: ApplyStatusTransitionCommand,
  ): Promise<EventStatusTransitionWriteResult>;
  softDelete(
    userId: string,
    eventId: string,
    deletedAt: Date,
  ): Promise<boolean>;
  purgeDeletedBefore(cutoff: Date): Promise<number>;
}
