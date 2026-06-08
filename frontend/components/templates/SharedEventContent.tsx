"use client";

import { useEffect, useState } from "react";
import CommentComposer from "@/components/molecules/CommentComposer";
import CommentThread from "@/components/organisms/CommentThread";
import type { EventCommentItem } from "@/features/events/event-comments-api";
import { formatEventDateRange } from "@/features/events/event-status";

type SharedEvent = {
  id: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: string;
  toDateTime: string;
  status: string;
  tags: Array<{ name: string; label: string }>;
};

type SharedEventContentProps = {
  eventId: string;
};

export default function SharedEventContent({ eventId }: SharedEventContentProps) {
  const [event, setEvent] = useState<SharedEvent | null>(null);
  const [comments, setComments] = useState<EventCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchSharedEvent() {
      setIsLoading(true);
      setError(null);

      try {
        const [eventResponse, commentsResponse] = await Promise.all([
          fetch(`/api/shared/events/${eventId}`),
          fetch(`/api/shared/events/${eventId}/comments`),
        ]);

        if (!eventResponse.ok || !commentsResponse.ok) {
          throw new Error("No se pudo cargar el evento compartido");
        }

        const eventData = await eventResponse.json();
        const commentsData = await commentsResponse.json();
        if (isCancelled) return;

        setEvent(eventData.event);
        setComments(commentsData.items);
      } catch (fetchError) {
        if (isCancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "No se pudo cargar el evento compartido",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchSharedEvent();

    return () => {
      isCancelled = true;
    };
  }, [eventId]);

  async function handleCreateComment(body: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/shared/events/${eventId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const responseError = await response.json().catch(() => null);
        throw new Error(responseError?.message ?? "No se pudo comentar");
      }

      const data = await response.json();
      setComments((currentComments) => [...currentComments, data.comment]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Cargando evento...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : event ? (
          <>
            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Evento compartido
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{event.name}</h1>
              <p className="mt-2 text-sm text-gray-600">
                {formatEventDateRange(event.fromDateTime, event.toDateTime)}
              </p>
              <p className="mt-4 text-sm text-gray-800">
                {event.description || "Sin descripción"}
              </p>
              {event.notes && (
                <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  {event.notes}
                </p>
              )}
            </article>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Comentarios</h2>
              <div className="mt-4">
                <CommentThread comments={comments} />
              </div>
              <div className="mt-4">
                <CommentComposer
                  isSubmitting={isSubmitting}
                  onSubmit={handleCreateComment}
                />
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
