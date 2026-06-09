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
  onAddComment?: (event: EventListItem) => void;
  onManageParticipants?: (event: EventListItem) => void;
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
  onAddComment,
  onManageParticipants,
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
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-earth-300 bg-earth-50">
      <div className="shrink-0 border-b border-earth-300 bg-earth-50 p-3 text-center text-base font-bold text-earth-900 md:text-lg">
        {EVENT_STATUS_LABELS[status]}
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:p-4 ${
          enableDragAndDrop && draggedEventId ? "bg-earth-100/80" : ""
        }`}
      >
        {events.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-earth-300 bg-earth-100 px-4 py-10 text-center text-sm text-earth-500">
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
              onAddComment={onAddComment}
              onManageParticipants={onManageParticipants}
            />
          ))
        )}
      </div>
    </section>
  );
}
