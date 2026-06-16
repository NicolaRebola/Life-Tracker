"use client";

import EventStatusChip from "@/components/atoms/EventStatusChip";
import { formatCompactEventTime } from "@/features/events/event-calendar";
import type { EventListItem } from "@/features/events/events-api";

type CalendarEventPillProps = {
  event: EventListItem;
  onEdit?: (event: EventListItem) => void;
};

export default function CalendarEventPill({ event, onEdit }: CalendarEventPillProps) {
  const isCreator = event.isCreator;
  const title = isCreator
    ? formatCompactEventTime(event.fromDateTime, event.toDateTime)
    : `Invitado · ${formatCompactEventTime(event.fromDateTime, event.toDateTime)}`;

  if (!isCreator) {
    return (
      <div
        className="flex items-center gap-1 truncate rounded-md border border-earth-300 bg-earth-100 px-2 py-1 text-left text-xs font-medium text-earth-700"
        title={title}
      >
        <span className="min-w-0 flex-1 truncate">{event.name}</span>
        <EventStatusChip status={event.status} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onEdit?.(event)}
      className="flex items-center gap-1 truncate rounded-md border border-earth-300 bg-earth-50 px-2 py-1 text-left text-xs font-medium text-earth-900 shadow-sm"
      title={title}
    >
      <span className="min-w-0 flex-1 truncate">{event.name}</span>
      <EventStatusChip status={event.status} />
    </button>
  );
}
