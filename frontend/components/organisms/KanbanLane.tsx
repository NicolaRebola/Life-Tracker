import EventCard from "@/components/molecules/EventCard";
import {
  EVENT_STATUS_LABELS,
  type EventStatus,
} from "@/features/events/event-status";
import type { EventListItem } from "@/features/events/events-api";

export type KanbanLaneProps = {
  status: EventStatus;
  events: EventListItem[];
  enableDragAndDrop?: boolean;
  draggedEventId?: string | null;
  onDragStart?: (eventId: string) => void;
  onDragEnd?: () => void;
  onDrop?: (status: EventStatus) => void;
  onStatusChange?: (eventId: string, status: EventStatus) => void;
  onEditEvent?: (event: EventListItem) => void;
  onDeleteEvent?: (event: EventListItem) => void;
};

export function KanbanLane({
  status,
  events,
  enableDragAndDrop = false,
  draggedEventId,
  onDragStart,
  onDragEnd,
  onDrop,
  onStatusChange,
  onEditEvent,
  onDeleteEvent,
}: KanbanLaneProps) {
  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (!enableDragAndDrop) return;
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    if (!enableDragAndDrop) return;
    event.preventDefault();
    onDrop?.(status);
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="shrink-0 border-b border-gray-200 bg-white p-3 text-center text-base font-bold text-gray-900 md:text-lg">
        {EVENT_STATUS_LABELS[status]}
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-4 ${
          enableDragAndDrop && draggedEventId ? "bg-gray-50/80" : ""
        }`}
      >
        {events.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            No hay eventos en esta columna
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              draggable={enableDragAndDrop}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onStatusChange={onStatusChange}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
            />
          ))
        )}
      </div>
    </section>
  );
}
