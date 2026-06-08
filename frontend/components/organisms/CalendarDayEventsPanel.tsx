"use client";

import CalendarEventCard from "@/components/molecules/CalendarEventCard";
import type { EventListItem } from "@/features/events/events-api";

type CalendarDayEventsPanelProps = {
  selectedDayKey: string | null;
  events: EventListItem[];
  onEditEvent?: (event: EventListItem) => void;
  onAddComment?: (event: EventListItem) => void;
  onDeleteEvent?: (event: EventListItem) => void;
};

export default function CalendarDayEventsPanel({
  selectedDayKey,
  events,
  onEditEvent,
  onAddComment,
  onDeleteEvent,
}: CalendarDayEventsPanelProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-4 md:hidden">
      <h3 className="text-sm font-semibold text-gray-900">
        {selectedDayKey
          ? `Eventos del ${selectedDayKey.split("-").reverse().join("/")}`
          : "Selecciona un día"}
      </h3>

      {selectedDayKey ? (
        events.length > 0 ? (
          <ul className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {events.map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                onEdit={onEditEvent}
                onAddComment={onAddComment}
                onDelete={onDeleteEvent}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No hay eventos para este día.</p>
        )
      ) : (
        <p className="mt-3 text-sm text-gray-500">
          Toca un día del calendario para ver sus eventos.
        </p>
      )}
    </div>
  );
}
