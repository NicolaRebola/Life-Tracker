import { EventsApiError } from './events-api';

export type EventParticipantItem = {
  id: string;
  email: string;
  displayName: string | null;
  status: 'ACCEPTED' | 'PENDING' | 'EXPIRED' | 'REVOKED';
  invitedAt?: string;
  joinedAt?: string;
  expiresAt?: string;
  deliveryFailedAt?: string;
  lastDeliveryError?: string | null;
};

export type ListEventParticipantsResponse = {
  items: EventParticipantItem[];
};

export class EventParticipantsApiError extends EventsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'EventParticipantsApiError';
  }
}

export class InviteEventParticipantError extends EventParticipantsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'InviteEventParticipantError';
  }
}

async function parseErrorResponse(res: Response, fallbackMessage: string) {
  const responseError = await res.json().catch(() => null);
  throw new EventParticipantsApiError(
    responseError?.message ?? fallbackMessage,
    res.status,
    responseError?.fields,
  );
}

export function getParticipantLabel(participant: EventParticipantItem) {
  return participant.displayName?.trim() || participant.email;
}

export function normalizeParticipantEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listEventParticipants(
  eventId: string,
): Promise<ListEventParticipantsResponse> {
  const res = await fetch(`/api/events/${eventId}/participants`);

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudieron cargar los participantes');
  }

  return res.json() as Promise<ListEventParticipantsResponse>;
}

export async function inviteEventParticipant(eventId: string, email: string) {
  const res = await fetch(`/api/events/${eventId}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: normalizeParticipantEmail(email) }),
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new InviteEventParticipantError(
      responseError?.message ?? 'No se pudo invitar al participante',
      res.status,
      responseError?.fields,
    );
  }

  return res.json();
}

export async function removeEventParticipant(
  eventId: string,
  participantId: string,
): Promise<void> {
  const res = await fetch(`/api/events/${eventId}/participants/${participantId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudo quitar el participante');
  }
}
