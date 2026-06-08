"use client";

import { useEffect, useRef, useState } from "react";
import { Trash1 } from "@tailgrids/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardHeader } from "@/components/tailgrids/core/card";
import {
  EVENT_STATUS_LABELS,
  type EventStatus,
  formatEventDateRange,
} from "@/features/events/event-status";
import type { EventListItem } from "@/features/events/events-api";

type EventCardProps = {
  event: EventListItem;
  draggable?: boolean;
  onDragStart?: (eventId: string) => void;
  onDragEnd?: () => void;
  onStatusChange?: (eventId: string, status: EventStatus) => void;
  onEdit?: (event: EventListItem) => void;
  onDelete?: (event: EventListItem) => void;
};

const STATUS_OPTIONS: EventStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M12.5 3.5L16.5 7.5L7 17H3V13L12.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreVerticalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  );
}

export default function EventCard({
  event,
  draggable = false,
  onDragStart,
  onDragEnd,
  onStatusChange,
  onEdit,
  onDelete,
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(mouseEvent: MouseEvent) {
      if (!menuRef.current?.contains(mouseEvent.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const availableStatusOptions = STATUS_OPTIONS.filter(
    (status) => status !== event.status,
  );

  return (
    <div
      draggable={draggable}
      onDragStart={() => onDragStart?.(event.id)}
      onDragEnd={onDragEnd}
      className={draggable ? "cursor-grab active:cursor-grabbing" : undefined}
    >
    <Card className="relative w-full border border-gray-200 rounded-xl bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-900">{event.name}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {formatEventDateRange(event.fromDateTime, event.toDateTime)}
          </p>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Abrir menú del evento"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex size-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            <MoreVerticalIcon />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              {availableStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 md:hidden"
                  onClick={() => {
                    onStatusChange?.(event.id, status);
                    setIsMenuOpen(false);
                  }}
                >
                  Mover a {EVENT_STATUS_LABELS[status]}
                </button>
              ))}

              {availableStatusOptions.length > 0 && (
                <div className="border-t border-gray-200 md:hidden" />
              )}

              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  onDelete?.(event);
                  setIsMenuOpen(false);
                }}
              >
                <Trash1 className="size-4 text-red-500" />
                Eliminar
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  onEdit?.(event);
                  setIsMenuOpen(false);
                }}
              >
                <PencilIcon />
                Editar
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <p className="line-clamp-3 text-sm text-gray-700">
          {event.description || "Sin descripción"}
        </p>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <Badge key={tag.name} color="gray" size="sm">
                {tag.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
