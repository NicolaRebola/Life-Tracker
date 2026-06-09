import type { EventStatus } from './event-status';

export type EventFormValues = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description: string;
  notes: string;
  tags: string;
};

export type CreateEventPayload = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description: string;
  notes: string;
  tags: string[];
};

export type EventListItem = {
  id: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: string;
  toDateTime: string;
  status: EventStatus;
  tags: Array<{ name: string; label: string }>;
  commentCount: number;
  participantCount: number;
  creator: {
    id: string;
    displayName: string | null;
    email: string;
  };
  isCreator: boolean;
};

export type ListEventsFilters = {
  name?: string;
  status?: EventStatus | '';
  tags?: string;
  fromDateTime?: string;
  toDateTime?: string;
  page?: number;
  limit?: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListEventsResponse = {
  items: EventListItem[];
  pagination: Pagination;
};

export type EventTagSuggestion = {
  name: string;
  label: string;
};

export type SearchEventTagsResponse = {
  items: EventTagSuggestion[];
};

export class EventsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: string[],
  ) {
    super(message);
    this.name = 'EventsApiError';
  }
}

export class CreateEventError extends EventsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'CreateEventError';
  }
}

export class UpdateEventError extends EventsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'UpdateEventError';
  }
}

function buildEventPayload(values: EventFormValues): CreateEventPayload {
  return {
    fromDateTime: values.fromDateTime,
    toDateTime: values.toDateTime,
    name: values.name.trim(),
    description: values.description.trim(),
    notes: values.notes.trim(),
    tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  };
}

function toDateTimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function eventListItemToFormValues(event: EventListItem): EventFormValues {
  return {
    fromDateTime: toDateTimeLocalValue(event.fromDateTime),
    toDateTime: toDateTimeLocalValue(event.toDateTime),
    name: event.name,
    description: event.description,
    notes: event.notes,
    tags: event.tags.map((tag) => tag.label).join(', '),
  };
}

function buildListEventsQuery(filters: ListEventsFilters = {}) {
  const params = new URLSearchParams();

  const name = filters.name?.trim();
  if (name) params.set('name', name);

  if (filters.status) params.set('status', filters.status);

  const tags = filters.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags?.length) params.set('tags', tags.join(','));

  if (filters.fromDateTime) params.set('fromDateTime', filters.fromDateTime);
  if (filters.toDateTime) params.set('toDateTime', filters.toDateTime);

  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function parseErrorResponse(res: Response, fallbackMessage: string) {
  const responseError = await res.json().catch(() => null);
  throw new EventsApiError(
    responseError?.message ?? fallbackMessage,
    res.status,
    responseError?.fields,
  );
}

export async function createEvent(values: EventFormValues) {
  const payload = buildEventPayload(values);

  const res = await fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new CreateEventError(
      responseError?.message ?? 'No se pudo crear el evento',
      res.status,
      responseError?.fields,
    );
  }

  return res.json();
}

export async function updateEvent(eventId: string, values: EventFormValues) {
  const payload = buildEventPayload(values);

  const res = await fetch(`/api/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new UpdateEventError(
      responseError?.message ?? 'No se pudo actualizar el evento',
      res.status,
      responseError?.fields,
    );
  }

  return res.json();
}

export async function listEvents(
  filters: ListEventsFilters = {},
): Promise<ListEventsResponse> {
  const res = await fetch(`/api/events${buildListEventsQuery(filters)}`);

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudieron cargar los eventos');
  }

  return res.json() as Promise<ListEventsResponse>;
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  const res = await fetch(`/api/events/${eventId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudo actualizar el estado del evento');
  }

  return res.json() as Promise<{ event: { id: string; status: EventStatus } }>;
}

export class DeleteEventError extends EventsApiError {
  constructor(
    message: string,
    status: number,
    fields?: string[],
  ) {
    super(message, status, fields);
    this.name = 'DeleteEventError';
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await fetch(`/api/events/${eventId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new DeleteEventError(
      responseError?.message ?? 'No se pudo eliminar el evento',
      res.status,
      responseError?.fields,
    );
  }
}

export async function searchEventTags(
  name: string,
): Promise<SearchEventTagsResponse> {
  const params = new URLSearchParams();
  const normalizedName = name.trim();

  if (normalizedName) params.set('name', normalizedName);
  params.set('limit', '10');

  const res = await fetch(`/api/events/tags?${params.toString()}`);

  if (!res.ok) {
    await parseErrorResponse(res, 'No se pudieron buscar tags');
  }

  return res.json() as Promise<SearchEventTagsResponse>;
}
