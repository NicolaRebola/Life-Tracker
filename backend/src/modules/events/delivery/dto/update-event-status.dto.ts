import type { EventStatus } from '../../domain/entities/event-status';

export type UpdateEventStatusDto = {
  status: EventStatus;
};
