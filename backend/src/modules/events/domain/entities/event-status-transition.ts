import type { EventStatus } from './event-status';

export type EventStatusTransition = {
  eventId: string;
  fromStatus: EventStatus;
  toStatus: EventStatus;
  occurredAt: Date;
  changed: boolean;
};
