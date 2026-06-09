import type { EventStatus } from '../../domain/entities/event-status';

export class UpdateEventStatusConflictError extends Error {
  constructor(
    message: string,
    public readonly fromStatus: EventStatus,
    public readonly currentStatus: EventStatus,
    public readonly requestedStatus: EventStatus,
  ) {
    super(message);
    this.name = 'UpdateEventStatusConflictError';
  }
}
