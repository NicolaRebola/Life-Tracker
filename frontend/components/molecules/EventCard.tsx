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
  onAddComment?: (event: EventListItem) => void;
  onManageParticipants?: (event: EventListItem) => void;
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

function MessagesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M3.5 4.5H16.5V13.5H6.2L3.5 16.2V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ParticipantsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M7.5 9.5C9.2 9.5 10.5 8.2 10.5 6.5C10.5 4.8 9.2 3.5 7.5 3.5C5.8 3.5 4.5 4.8 4.5 6.5C4.5 8.2 5.8 9.5 7.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.8 16.5C3.3 13.8 5.1 12.3 7.5 12.3C9.9 12.3 11.7 13.8 12.2 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 9.2C14.2 8.8 15 7.8 15 6.5C15 5.3 14.3 4.3 13.2 3.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.4 12.6C15.2 13.1 16.4 14.4 16.8 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
  onAddComment,
  onManageParticipants,
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

  const isCreator = event.isCreator;
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
    <Card className="relative w-full border border-earth-300 rounded-xl bg-earth-50 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-earth-900">{event.name}</h3>
          <p className="mt-1 text-xs text-earth-500">
            {formatEventDateRange(event.fromDateTime, event.toDateTime)}
          </p>
          <p className="mt-1 truncate text-xs text-earth-500">
            {isCreator
              ? `Creado por ${event.creator.displayName || event.creator.email}`
              : `Invitado · Creado por ${event.creator.displayName || event.creator.email}`}
          </p>
          {!isCreator && (
            <Badge color="gray" size="sm" className="mt-2">
              Invitado
            </Badge>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative inline-flex items-center rounded-md text-earth-600 hover:bg-earth-100"
            aria-label={`Abrir comentarios (${event.commentCount})`}
            onClick={() => onAddComment?.(event)}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-md text-earth-600">
              <MessagesIcon />
            </span>
            {event.commentCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-primary-text">
                {event.commentCount > 99 ? "99+" : event.commentCount}
              </span>
            )}
          </button>

          {isCreator && (
            <>
          <button
            type="button"
            className="relative inline-flex items-center rounded-md text-earth-600 hover:bg-earth-100"
            aria-label={`Abrir participantes (${event.participantCount})`}
            onClick={() => onManageParticipants?.(event)}
          >
            <span className="inline-flex size-8 items-center justify-center rounded-md text-earth-600">
              <ParticipantsIcon />
            </span>
            {event.participantCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-semibold text-primary-text">
                {event.participantCount > 99 ? "99+" : event.participantCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Abrir menú del evento"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex size-8 items-center justify-center rounded-md text-earth-600 hover:bg-earth-100"
          >
            <MoreVerticalIcon />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-earth-300 bg-earth-50 shadow-lg">
              {availableStatusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="flex w-full items-center px-4 py-3 text-left text-sm text-earth-700 hover:bg-earth-100 md:hidden"
                  onClick={() => {
                    onStatusChange?.(event.id, status);
                    setIsMenuOpen(false);
                  }}
                >
                  Mover a {EVENT_STATUS_LABELS[status]}
                </button>
              ))}

              {availableStatusOptions.length > 0 && (
                <div className="border-t border-earth-300 md:hidden" />
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-earth-700 hover:bg-earth-100"
                onClick={() => {
                  onAddComment?.(event);
                  setIsMenuOpen(false);
                }}
              >
                <MessagesIcon />
                Add comment
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-earth-700 hover:bg-earth-100"
                onClick={() => {
                  onManageParticipants?.(event);
                  setIsMenuOpen(false);
                }}
              >
                <ParticipantsIcon />
                Participantes
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-earth-700 hover:bg-earth-100"
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
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        <p className="line-clamp-3 text-sm text-earth-700">
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
