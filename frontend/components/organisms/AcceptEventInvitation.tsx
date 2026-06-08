"use client";

import { useState } from "react";

type AcceptEventInvitationProps = {
  token: string;
};

export default function AcceptEventInvitation({
  token,
}: AcceptEventInvitationProps) {
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedEventId, setAcceptedEventId] = useState<string | null>(null);

  async function handleAccept() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/event-invitations/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: displayName.trim() || null }),
      });

      if (!response.ok) {
        const responseError = await response.json().catch(() => null);
        throw new Error(
          responseError?.message ?? "No se pudo aceptar la invitación",
        );
      }

      const data = await response.json();
      setAcceptedEventId(data.participant.eventId);
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "No se pudo aceptar la invitación",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Invitación a evento
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Aceptá la invitación para consultar el evento y participar del thread
          de comentarios.
        </p>

        {acceptedEventId ? (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            Invitación aceptada. Ya podés abrir el evento compartido.
            <a
              href={`/shared/events/${acceptedEventId}`}
              className="mt-3 block font-semibold underline"
            >
              Ver evento
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Nombre visible (opcional)
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-primary-500"
                placeholder="Tu nombre"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void handleAccept();
              }}
              className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Aceptando..." : "Aceptar invitación"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
