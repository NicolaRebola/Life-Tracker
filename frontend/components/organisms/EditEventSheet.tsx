"use client";

import EventForm from "@/components/templates/EventForm";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
} from "@/components/tailgrids/core/sheet";
import {
  eventListItemToFormValues,
  type EventListItem,
} from "@/features/events/events-api";

type EditEventSheetProps = {
  event: EventListItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEventUpdated?: () => void;
};

export default function EditEventSheet({
  event,
  isOpen,
  onOpenChange,
  onEventUpdated,
}: EditEventSheetProps) {
  if (!event) {
    return null;
  }

  const initialValues = eventListItemToFormValues(event);

  return (
    <Sheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetOverlay>
        <SheetContent side="bottom" className="md:hidden">
          <EventForm
            key={event.id}
            mode="edit"
            eventId={event.id}
            initialValues={initialValues}
            onSuccess={() => {
              onOpenChange(false);
              onEventUpdated?.();
            }}
          />
        </SheetContent>
        <SheetContent side="right" className="hidden md:flex">
          <EventForm
            key={event.id}
            mode="edit"
            eventId={event.id}
            initialValues={initialValues}
            onSuccess={() => {
              onOpenChange(false);
              onEventUpdated?.();
            }}
          />
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
}
