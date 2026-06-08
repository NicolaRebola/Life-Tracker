"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import { Toast } from "@/components/tailgrids/core/toast";
import {
  getParticipantLabel,
  inviteEventParticipant,
  listEventParticipants,
  removeEventParticipant,
  type EventParticipantItem,
} from "@/features/events/event-participants-api";
import type { EventListItem } from "@/features/events/events-api";

type EventParticipantsSheetProps = {
  event: EventListItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onParticipantCountChange?: (eventId: string, participantCount: number) => void;
};

type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

const STATUS_LABELS: Record<EventParticipantItem["status"], string> = {
  ACCEPTED: "Aceptado",
  PENDING: "Pendiente",
  EXPIRED: "Expirado",
  REVOKED: "Revocado",
};

export default function EventParticipantsSheet({
  event,
  isOpen,
  onOpenChange,
  onParticipantCountChange,
}: EventParticipantsSheetProps) {
  const [participants, setParticipants] = useState<EventParticipantItem[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const eventId = event?.id;

  useEffect(() => {
    if (!isOpen || !eventId) return;

    const currentEventId = eventId;
    let isCancelled = false;

    async function fetchParticipants() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listEventParticipants(currentEventId);
        if (isCancelled) return;

        setParticipants(response.items);
        onParticipantCountChange?.(
          currentEventId,
          response.items.filter((item) => item.status === "ACCEPTED").length,
        );
      } catch (fetchError) {
        if (isCancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "No se pudieron cargar los participantes",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchParticipants();

    return () => {
      isCancelled = true;
    };
  }, [eventId, isOpen, onParticipantCountChange]);

  async function handleInvite() {
    if (!event || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await inviteEventParticipant(event.id, email);
      const response = await listEventParticipants(event.id);
      setParticipants(response.items);
      setEmail("");
      setToast({ variant: "success", message: "Invitación generada" });
      onParticipantCountChange?.(
        event.id,
        response.items.filter((item) => item.status === "ACCEPTED").length,
      );
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "No se pudo invitar al participante",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(participant: EventParticipantItem) {
    if (!event || participant.status !== "ACCEPTED") return;

    setRemovingId(participant.id);
    setError(null);

    try {
      await removeEventParticipant(event.id, participant.id);
      const nextParticipants = participants.map((item) =>
        item.id === participant.id ? { ...item, status: "REVOKED" as const } : item,
      );
      setParticipants(nextParticipants);
      setToast({ variant: "success", message: "Participante removido" });
      onParticipantCountChange?.(
        event.id,
        nextParticipants.filter((item) => item.status === "ACCEPTED").length,
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "No se pudo quitar el participante",
      );
    } finally {
      setRemovingId(null);
    }
  }

  if (!event) return null;

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-[70] md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
      <Sheet isOpen={isOpen} onOpenChange={onOpenChange}>
        <SheetOverlay>
          <SheetContent side="right" className="h-full max-w-md">
            <SheetHeader>
              <SheetTitle>Participantes</SheetTitle>
              <SheetDescription>{event.name}</SheetDescription>
            </SheetHeader>
            <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
              {event.isCreator && (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(inputEvent) => setEmail(inputEvent.currentTarget.value)}
                    placeholder="persona@email.com"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || !email.trim()}
                    onClick={() => {
                      void handleInvite();
                    }}
                    className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Invitar
                  </button>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {isLoading ? (
                  <p className="text-sm text-gray-500">Cargando participantes...</p>
                ) : participants.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    Todavía no hay participantes invitados.
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={`${participant.status}-${participant.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {getParticipantLabel(participant)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {STATUS_LABELS[participant.status]}
                          {participant.lastDeliveryError
                            ? ` · ${participant.lastDeliveryError}`
                            : ""}
                        </p>
                      </div>
                      {event.isCreator && participant.status === "ACCEPTED" && (
                        <button
                          type="button"
                          disabled={removingId === participant.id}
                          onClick={() => {
                            void handleRemove(participant);
                          }}
                          className="text-sm font-semibold text-red-600 disabled:opacity-60"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </SheetBody>
          </SheetContent>
        </SheetOverlay>
      </Sheet>
    </>
  );
}
