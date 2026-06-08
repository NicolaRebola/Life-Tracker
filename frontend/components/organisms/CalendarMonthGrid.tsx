"use client";

import CalendarDayCell from "@/components/molecules/CalendarDayCell";
import type { CalendarWeek } from "@/features/events/event-calendar";
import type { EventListItem } from "@/features/events/events-api";

type CalendarMonthGridProps = {
  weeks: CalendarWeek[];
  weekdayLabels: string[];
  eventsByDay: Record<string, EventListItem[]>;
  selectedDayKey: string | null;
  onSelectDay: (dayKey: string) => void;
  onEditEvent?: (event: EventListItem) => void;
};

export default function CalendarMonthGrid({
  weeks,
  weekdayLabels,
  eventsByDay,
  selectedDayKey,
  onSelectDay,
  onEditEvent,
}: CalendarMonthGridProps) {
  return (
    <>
      <div className="hidden min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white md:flex">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col" role="grid" aria-label="Calendario mensual">
          {weeks.map((week, weekIndex) => (
            <div
              key={week.days[0]?.key ?? weekIndex}
              role="row"
              className="grid min-h-32 flex-1 grid-cols-7 border-b border-gray-100 last:border-b-0"
            >
              {week.days.map((day) => (
                <CalendarDayCell
                  key={day.key}
                  day={day}
                  events={eventsByDay[day.key] ?? []}
                  onSelectDay={onSelectDay}
                  onEditEvent={onEditEvent}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 md:hidden">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-semibold uppercase text-gray-500"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.flatMap((week) =>
            week.days.map((day) => {
              const dayEvents = eventsByDay[day.key] ?? [];
              const isSelected = selectedDayKey === day.key;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => onSelectDay(day.key)}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-xl border text-xs ${
                    isSelected
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : day.isCurrentMonth
                        ? "border-gray-100 bg-white text-gray-900"
                        : "border-transparent bg-gray-50 text-gray-400"
                  } ${day.isToday ? "ring-1 ring-primary-300" : ""}`}
                >
                  <span className="font-semibold">{day.dayOfMonth}</span>
                  {dayEvents.length > 0 && (
                    <span className="mt-1 size-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </>
  );
}
