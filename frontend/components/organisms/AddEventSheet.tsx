"use client";

import { useEffect, useState } from "react";
import EventForm from "@/components/organisms/EventForm";
import { buttonStyles } from "@/components/tailgrids/core/button";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "@/components/tailgrids/core/sheet";

type AddEventSheetProps = {
  onEventCreated?: () => void;
};

export default function AddEventSheet({ onEventCreated }: AddEventSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  function handleSuccess() {
    setIsOpen(false);
    onEventCreated?.();
  }

  return (
    <Sheet isOpen={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className={
          "w-full md:w-auto " +
          buttonStyles({ appearance: "fill", variant: "primary", size: "sm" })
        }
      >
        Agregar Evento
      </SheetTrigger>

      <SheetOverlay>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={isDesktop ? "h-full max-w-sm" : "max-h-[85vh]"}
        >
          <EventForm onSuccess={handleSuccess} />
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
}
