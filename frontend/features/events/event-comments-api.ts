import { EventsApiError } from './events-api';

export type EventCommentItem = {
  id: string;
  eventId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
  author: {
    id: string;
    displayName: string | null;
    email: string;
  };
};

export function formatCommentDate(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getCommentAuthorLabel(comment: EventCommentItem) {
  return comment.author.displayName?.trim() || comment.author.email;
}

export function getCommentAuthorInitial(comment: EventCommentItem) {
  const label = getCommentAuthorLabel(comment);
  return label.charAt(0).toUpperCase();
}

export type ListEventCommentsResponse = {
  items: EventCommentItem[];
};

export class EventCommentsApiError extends EventsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'EventCommentsApiError';
  }
}

export class CreateEventCommentError extends EventCommentsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'CreateEventCommentError';
  }
}

export class UpdateEventCommentError extends EventCommentsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'UpdateEventCommentError';
  }
}

export class DeleteEventCommentError extends EventCommentsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'DeleteEventCommentError';
  }
}

async function parseErrorResponse(res: Response, fallbackMessage: string) {
  const responseError = await res.json().catch(() => null);
  throw new EventCommentsApiError(
    responseError?.message ?? fallbackMessage,
    res.status,
    responseError?.fields,
  );
}

export async function listEventComments(
  eventId: string,
): Promise<ListEventCommentsResponse> {
  const res = await fetch(`/api/events/${eventId}/comments`);

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudieron cargar los comentarios');
  }

  return res.json() as Promise<ListEventCommentsResponse>;
}

export async function createEventComment(eventId: string, body: string) {
  const res = await fetch(`/api/events/${eventId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: body.trim() }),
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new CreateEventCommentError(
      responseError?.message ?? 'No se pudo crear el comentario',
      res.status,
      responseError?.fields,
    );
  }

  return res.json() as Promise<{ comment: EventCommentItem }>;
}

export async function updateEventComment(
  eventId: string,
  commentId: string,
  body: string,
) {
  const res = await fetch(`/api/events/${eventId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: body.trim() }),
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new UpdateEventCommentError(
      responseError?.message ?? 'No se pudo actualizar el comentario',
      res.status,
      responseError?.fields,
    );
  }

  return res.json() as Promise<{ comment: EventCommentItem }>;
}

export async function deleteEventComment(
  eventId: string,
  commentId: string,
): Promise<void> {
  const res = await fetch(`/api/events/${eventId}/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new DeleteEventCommentError(
      responseError?.message ?? 'No se pudo eliminar el comentario',
      res.status,
      responseError?.fields,
    );
  }
}
