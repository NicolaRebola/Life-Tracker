export const EVENT_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export function isEventStatus(value: string): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}

export function formatEventDateRange(fromDateTime: string, toDateTime: string) {
  const from = new Date(fromDateTime);
  const to = new Date(toDateTime);

  const dateFormatter = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const sameDay = from.toDateString() === to.toDateString();

  if (sameDay) {
    return `${dateFormatter.format(from)} ${timeFormatter.format(from)} - ${timeFormatter.format(to)}`;
  }

  return `${dateFormatter.format(from)} ${timeFormatter.format(from)} - ${dateFormatter.format(to)} ${timeFormatter.format(to)}`;
}
