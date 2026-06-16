"use client";

import EventStatusChip from "@/components/atoms/EventStatusChip";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { formatCompactEventTime } from "@/features/events/event-calendar";
import type { EventListItem } from "@/features/events/events-api";

type CalendarEventCardProps = {
  event: EventListItem;
  onEdit?: (event: EventListItem) => void;
  onAddComment?: (event: EventListItem) => void;
  onManageParticipants?: (event: EventListItem) => void;
  onDelete?: (event: EventListItem) => void;
};

export default function CalendarEventCard({
  event,
  onEdit,
  onAddComment,
  onManageParticipants,
  onDelete,
}: CalendarEventCardProps) {
  const isCreator = event.isCreator;

  return (
    <li className="rounded-xl border border-earth-300 bg-earth-50 p-3 shadow-sm">
      {isCreator ? (
        <button
          type="button"
          className="w-full text-left"
          onClick={() => onEdit?.(event)}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 font-semibold text-earth-900">{event.name}</p>
            <EventStatusChip status={event.status} />
          </div>
          <p className="mt-1 text-xs text-earth-600">
            {formatCompactEventTime(event.fromDateTime, event.toDateTime)}
          </p>
          <p className="mt-1 text-xs text-earth-500">
            Creado por {event.creator.displayName || event.creator.email}
          </p>
        </button>
      ) : (
        <div className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 font-semibold text-earth-900">{event.name}</p>
            <EventStatusChip status={event.status} />
          </div>
          <p className="mt-1 text-xs text-earth-600">
            {formatCompactEventTime(event.fromDateTime, event.toDateTime)}
          </p>
          <p className="mt-1 text-xs text-earth-500">
            Invitado · Creado por {event.creator.displayName || event.creator.email}
          </p>
          <Badge color="gray" size="sm" className="mt-2">
            Invitado
          </Badge>
        </div>
      )}
      {isCreator && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            appearance="outline"
            variant="ghost"
            size="sm"
            onClick={() => onAddComment?.(event)}
          >
            Comentarios ({event.commentCount})
          </Button>
          <Button
            type="button"
            appearance="outline"
            variant="ghost"
            size="sm"
            onClick={() => onManageParticipants?.(event)}
          >
            Participantes ({event.participantCount})
          </Button>
          <Button
            type="button"
            appearance="outline"
            variant="danger"
            size="sm"
            onClick={() => onDelete?.(event)}
          >
            Eliminar
          </Button>
        </div>
      )}
    </li>
  );
}
