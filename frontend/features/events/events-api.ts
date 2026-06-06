export type EventFormValues = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description: string;
  notes: string;
  tags: string;
}

export type CreateEventPayload = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description: string;
  notes: string;
  tags: string[];
};

export class CreateEventError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: string[],
  ) {
    super(message);
    this.name = "CreateEventError";
  }
}

export async function createEvent(values: EventFormValues) {
  const payload: CreateEventPayload = {
    fromDateTime: values.fromDateTime,
    toDateTime: values.toDateTime,
    name: values.name.trim(),
    description: values.description.trim(),
    notes: values.notes.trim(),
    tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  }

  const res = await fetch("/api/events", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const responseError = await res.json().catch(() => null);
    throw new CreateEventError(
      responseError?.message ?? "No se pudo crear el evento",
      res.status,
      responseError?.fields,
    );
  }

  return res.json();
}