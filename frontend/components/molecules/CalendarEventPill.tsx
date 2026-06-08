"use client";

import EventStatusChip from "@/components/atoms/EventStatusChip";
import { formatCompactEventTime } from "@/features/events/event-calendar";
import type { EventListItem } from "@/features/events/events-api";

type CalendarEventPillProps = {
  event: EventListItem;
  onEdit?: (event: EventListItem) => void;
};

export default function CalendarEventPill({ event, onEdit }: CalendarEventPillProps) {
  return (
    <button
      type="button"
      onClick={() => onEdit?.(event)}
      className="flex items-center gap-1 truncate rounded-md border border-gray-200 bg-white px-2 py-1 text-left text-xs font-medium text-gray-900 shadow-sm"
      title={formatCompactEventTime(event.fromDateTime, event.toDateTime)}
    >
      <span className="min-w-0 flex-1 truncate">{event.name}</span>
      <EventStatusChip status={event.status} />
    </button>
  );
}
