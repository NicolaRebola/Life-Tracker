"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type AcceptEventInvitationProps = {
  token: string;
};

type EventInvitationPreview = {
  eventId: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  invitedUserExists: boolean;
};

export default function AcceptEventInvitation({
  token,
}: AcceptEventInvitationProps) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<EventInvitationPreview | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedEventId, setAcceptedEventId] = useState<string | null>(null);

  const acceptInvitation = useCallback(async (nextDisplayName: string | null) => {
    const response = await fetch(`/api/event-invitations/${token}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ displayName: nextDisplayName }),
    });

    if (!response.ok) {
      const responseError = await response.json().catch(() => null);
      throw new Error(
        responseError?.message ?? "No se pudo aceptar la invitación",
      );
    }

    return response.json();
  }, [token]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchInvitation() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/event-invitations/${token}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const responseError = await response.json().catch(() => null);
          throw new Error(
            responseError?.message ?? "No se pudo cargar la invitación",
          );
        }

        const data = await response.json();
        if (isCancelled) return;

        if (data.invitation?.invitedUserExists) {
          await acceptInvitation(null);
          if (isCancelled) return;
          router.replace("/home");
          return;
        }

        setInvitation(data.invitation);
      } catch (fetchError) {
        if (isCancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "No se pudo cargar la invitación",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchInvitation();

    return () => {
      isCancelled = true;
    };
  }, [acceptInvitation, router, token]);

  async function handleAccept() {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await acceptInvitation(displayName.trim() || null);
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
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-earth-300/70 bg-earth-50/85 p-6 shadow-sm backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-earth-900">
          Invitación a evento
        </h1>
        <p className="mt-2 text-sm text-earth-600">
          Consultá el evento compartido o creá tu cuenta para usar Life Tracker
          con tu propio espacio.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-earth-600">Validando invitación...</p>
        ) : acceptedEventId ? (
          <div className="mt-6 rounded-xl bg-earth-sage-100 p-4 text-sm text-earth-sage-600">
            Invitación aceptada. Ya podés abrir el evento compartido.
            <a
              href={`/shared/events/${acceptedEventId}`}
              className="mt-3 block font-semibold underline"
            >
              Ver evento
            </a>
          </div>
        ) : invitation ? (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-earth-700">
              Nombre visible (opcional)
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
                className="mt-2 w-full rounded-xl border border-earth-300 px-3 py-2 outline-none focus:border-primary-500"
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
              className="w-full rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-primary-text disabled:opacity-60"
            >
              {isSubmitting ? "Abriendo evento..." : "Ver evento"}
            </button>

            <Link
              href="/"
              className="block w-full rounded-xl border border-earth-300 px-4 py-3 text-center text-sm font-semibold text-earth-700 hover:bg-earth-100"
            >
              Crear cuenta
            </Link>
          </div>
        ) : (
          error && <p className="mt-6 text-sm text-red-600">{error}</p>
        )}
      </section>
    </main>
  );
}
