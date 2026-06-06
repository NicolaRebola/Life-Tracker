export const EVENT_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_TRANSITIONS: Record<
  EventStatus,
  readonly EventStatus[]
> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['TODO', 'DONE'],
  DONE: ['IN_PROGRESS'],
};

export function isEventStatus(value: string): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}

export function getAllowedEventStatusTransitions(
  status: EventStatus,
): readonly EventStatus[] {
  return EVENT_STATUS_TRANSITIONS[status];
}

export function canTransitionEventStatus(
  from: EventStatus,
  to: EventStatus,
): boolean {
  if (from === to) {
    return true;
  }

  return EVENT_STATUS_TRANSITIONS[from].includes(to);
}

export function isIdempotentEventStatusTransition(
  from: EventStatus,
  to: EventStatus,
): boolean {
  return from === to;
}
