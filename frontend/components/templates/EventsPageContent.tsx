"use client";

import { useState } from "react";
import AddEventSheet from "@/components/organisms/AddEventSheet";
import EditEventSheet from "@/components/organisms/EditEventSheet";
import KanbanBoard from "@/components/templates/KanbanBoard";
import type { EventListItem } from "@/features/events/events-api";

export default function EventsPageContent() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState<EventListItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function handleEditEvent(event: EventListItem) {
    setEditingEvent(event);
    setIsEditOpen(true);
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-4 pb-20 md:p-10 md:pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-sm text-gray-600">
            Organiza tus eventos en diferentes columnas
          </p>
        </div>
        <div>
          <AddEventSheet onEventCreated={() => setRefreshKey((key) => key + 1)} />
        </div>
      </div>
      <KanbanBoard
        refreshKey={refreshKey}
        onEditEvent={handleEditEvent}
      />
      <EditEventSheet
        event={editingEvent}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingEvent(null);
          }
        }}
        onEventUpdated={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  );
}
