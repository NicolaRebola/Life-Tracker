"use client";

import { useState } from "react";
import EventForm from "@/components/templates/EventForm";
import { buttonStyles } from "@/components/tailgrids/core/button";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "@/components/tailgrids/core/sheet";

export default function AddEventSheet() {
  const [isOpen, setIsOpen] = useState(false);

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
        <SheetContent side="bottom" className="md:hidden">
          <EventForm onSuccess={() => setIsOpen(false)} />
        </SheetContent>
        <SheetContent side="right" className="hidden md:flex">
          <EventForm onSuccess={() => setIsOpen(false)} />
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
}
