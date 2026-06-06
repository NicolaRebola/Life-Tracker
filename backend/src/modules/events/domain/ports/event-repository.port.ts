import type { Event } from '../entities/event.entity';

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');

export interface EventRepositoryPort {
  save(event: Event): Promise<Event>;
}
