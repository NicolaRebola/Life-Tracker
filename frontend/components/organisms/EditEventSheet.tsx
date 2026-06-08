"use client";

import { useEffect, useState } from "react";
import EventForm from "@/components/organisms/EventForm";
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
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (query: MediaQueryListEvent) => {
      setIsDesktop(query.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!event) {
    return null;
  }

  const initialValues = eventListItemToFormValues(event);

  function handleSuccess() {
    onOpenChange(false);
    onEventUpdated?.();
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <SheetOverlay>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={isDesktop ? "h-full max-w-sm" : "max-h-[85vh]"}
        >
          <EventForm
            key={event.id}
            mode="edit"
            eventId={event.id}
            initialValues={initialValues}
            onSuccess={handleSuccess}
          />
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
}
