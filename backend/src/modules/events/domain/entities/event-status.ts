export const EVENT_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export function isEventStatus(value: string): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}
