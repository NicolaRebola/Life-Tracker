"use client";

import { Button } from "@/components/tailgrids/core/button";

export type EventsView = "kanban" | "calendar";

type EventsViewToggleProps = {
  activeView: EventsView;
  onViewChange: (view: EventsView) => void;
};

export default function EventsViewToggle({
  activeView,
  onViewChange,
}: EventsViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-earth-300 bg-earth-100 p-1"
      role="tablist"
      aria-label="Vista de eventos"
    >
      <Button
        type="button"
        appearance={activeView === "kanban" ? "fill" : "outline"}
        variant={activeView === "kanban" ? "primary" : "ghost"}
        size="sm"
        role="tab"
        aria-selected={activeView === "kanban"}
        onClick={() => onViewChange("kanban")}
      >
        Kanban
      </Button>
      <Button
        type="button"
        appearance={activeView === "calendar" ? "fill" : "outline"}
        variant={activeView === "calendar" ? "primary" : "ghost"}
        size="sm"
        role="tab"
        aria-selected={activeView === "calendar"}
        onClick={() => onViewChange("calendar")}
      >
        Calendario
      </Button>
    </div>
  );
}
