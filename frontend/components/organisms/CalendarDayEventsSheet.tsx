"use client";

import CalendarEventCard from "@/components/molecules/CalendarEventCard";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import type { EventListItem } from "@/features/events/events-api";

type CalendarDayEventsSheetProps = {
  selectedDayKey: string | null;
  isOpen: boolean;
  events: EventListItem[];
  onOpenChange: (isOpen: boolean) => void;
  onEditEvent?: (event: EventListItem) => void;
  onAddComment?: (event: EventListItem) => void;
  onManageParticipants?: (event: EventListItem) => void;
  onDeleteEvent?: (event: EventListItem) => void;
};

export default function CalendarDayEventsSheet({
  selectedDayKey,
  isOpen,
  events,
  onOpenChange,
  onEditEvent,
  onAddComment,
  onManageParticipants,
  onDeleteEvent,
}: CalendarDayEventsSheetProps) {
  const title = selectedDayKey
    ? `Eventos del ${selectedDayKey.split("-").reverse().join("/")}`
    : "Eventos del día";

  return (
    <Sheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetOverlay>
        <SheetContent side="bottom" className="max-h-[80dvh]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <SheetBody>
            {events.length > 0 ? (
              <ul className="space-y-3">
                {events.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onEdit={(e) => {
                      onOpenChange(false);
                      onEditEvent?.(e);
                    }}
                    onAddComment={onAddComment}
                    onManageParticipants={onManageParticipants}
                    onDelete={onDeleteEvent}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-earth-500">
                No hay eventos para este día.
              </p>
            )}
          </SheetBody>
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
}
