"use client";

import CalendarEventPill from "@/components/molecules/CalendarEventPill";
import type { CalendarDay } from "@/features/events/event-calendar";
import type { EventListItem } from "@/features/events/events-api";

type CalendarDayCellProps = {
  day: CalendarDay;
  events: EventListItem[];
  onSelectDay: (dayKey: string) => void;
  onEditEvent?: (event: EventListItem) => void;
};

export default function CalendarDayCell({
  day,
  events,
  onSelectDay,
  onEditEvent,
}: CalendarDayCellProps) {
  return (
    <div
      role="gridcell"
      aria-label={`${day.dayOfMonth}`}
      className={`flex min-h-32 flex-col border-r border-gray-100 p-2 text-left last:border-r-0 ${
        day.isCurrentMonth ? "bg-white" : "bg-gray-50"
      } ${day.isToday ? "ring-1 ring-inset ring-primary-300" : ""}`}
    >
      <button
        type="button"
        onClick={() => onSelectDay(day.key)}
        className={`mb-2 inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
          day.isToday
            ? "bg-primary-500 text-white"
            : day.isCurrentMonth
              ? "text-gray-900"
              : "text-gray-400"
        }`}
        aria-label={`Seleccionar día ${day.dayOfMonth}`}
      >
        {day.dayOfMonth}
      </button>

      <div className="flex flex-1 flex-col gap-1">
        {events.slice(0, 3).map((event) => (
          <CalendarEventPill key={event.id} event={event} onEdit={onEditEvent} />
        ))}
        {events.length > 3 && (
          <span className="text-xs text-gray-500">+{events.length - 3} más</span>
        )}
      </div>
    </div>
  );
}
