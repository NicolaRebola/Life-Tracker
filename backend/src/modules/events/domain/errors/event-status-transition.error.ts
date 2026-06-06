import type { EventStatus } from '../entities/event-status';

export class EventStatusTransitionError extends Error {
  constructor(
    message: string,
    public readonly fromStatus: EventStatus,
    public readonly toStatus: EventStatus,
    public readonly fields: string[] = ['status'],
  ) {
    super(message);
    this.name = 'EventStatusTransitionError';
  }
}
