import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEvent,
  CreateEventError,
  deleteEvent,
  DeleteEventError,
  eventListItemToFormValues,
  listEvents,
  searchEventTags,
  updateEvent,
  UpdateEventError,
  updateEventStatus,
  EventsApiError,
  type EventFormValues,
  type EventListItem,
} from "./events-api";

const formValues: EventFormValues = {
  fromDateTime: "2026-06-05T08:29",
  toDateTime: "2026-06-05T09:29",
  name: "  Evento de prueba  ",
  description: "  Descripcion  ",
  notes: "  Nota  ",
  tags: " universidad, analisis, , universidad ",
};

describe("createEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a normalized payload to the events BFF route", async () => {
    const responseBody = { event: { id: "event-1" } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(createEvent(formValues)).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: JSON.stringify({
        fromDateTime: "2026-06-05T08:29",
        toDateTime: "2026-06-05T09:29",
        name: "Evento de prueba",
        description: "Descripcion",
        notes: "Nota",
        tags: ["universidad", "analisis", "universidad"],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws a CreateEventError with message, status and fields when the BFF rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: "Datos invalidos",
          fields: ["name"],
        }),
      }),
    );

    await expect(createEvent(formValues)).rejects.toMatchObject<CreateEventError>({
      name: "CreateEventError",
      message: "Datos invalidos",
      status: 400,
      fields: ["name"],
    });
  });

  it("uses a fallback error message when the BFF response body cannot be parsed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      }),
    );

    await expect(createEvent(formValues)).rejects.toMatchObject<CreateEventError>({
      message: "No se pudo crear el evento",
      status: 500,
    });
  });
});

describe("listEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests filtered and paginated events from the BFF", async () => {
    const responseBody = {
      items: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listEvents({
        name: "clase",
        status: "TODO",
        tags: "universidad, analisis",
        page: 2,
        limit: 5,
      }),
    ).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/events?name=clase&status=TODO&tags=universidad%2Canalisis&page=2&limit=5",
    );
  });

  it("requests events filtered by date range from the BFF", async () => {
    const responseBody = {
      items: [],
      pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      listEvents({
        fromDateTime: "2026-06-01T00:00:00.000Z",
        toDateTime: "2026-07-01T00:00:00.000Z",
        limit: 500,
      }),
    ).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/events?fromDateTime=2026-06-01T00%3A00%3A00.000Z&toDateTime=2026-07-01T00%3A00%3A00.000Z&limit=500",
    );
  });

  it("throws an EventsApiError when listing fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Vuelve a iniciar sesión" }),
      }),
    );

    await expect(listEvents()).rejects.toMatchObject<EventsApiError>({
      name: "EventsApiError",
      message: "Vuelve a iniciar sesión",
      status: 401,
    });
  });
});

describe("updateEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a normalized payload to the events BFF route", async () => {
    const responseBody = {
      event: {
        id: "event-1",
        name: "Evento editado",
        description: "Descripcion",
        notes: "Nota",
        fromDateTime: "2026-06-06T10:00:00.000Z",
        toDateTime: "2026-06-06T11:00:00.000Z",
        status: "TODO",
        tags: [{ name: "universidad", label: "Universidad" }],
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(updateEvent("event-1", formValues)).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1", {
      method: "PATCH",
      body: JSON.stringify({
        fromDateTime: "2026-06-05T08:29",
        toDateTime: "2026-06-05T09:29",
        name: "Evento de prueba",
        description: "Descripcion",
        notes: "Nota",
        tags: ["universidad", "analisis", "universidad"],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws an UpdateEventError when the BFF rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          message: "Evento no encontrado",
        }),
      }),
    );

    await expect(updateEvent("missing-event", formValues)).rejects.toMatchObject<UpdateEventError>({
      name: "UpdateEventError",
      message: "Evento no encontrado",
      status: 404,
    });
  });
});

describe("eventListItemToFormValues", () => {
  it("maps list items to datetime-local form values and tag labels", () => {
    const event: EventListItem = {
      id: "event-1",
      name: "Evento",
      description: "Descripcion",
      notes: "Nota",
      fromDateTime: "2026-06-05T11:29:00.000Z",
      toDateTime: "2026-06-05T12:29:00.000Z",
      status: "TODO",
      tags: [
        { name: "universidad", label: "Universidad" },
        { name: "analisis", label: "Analisis" },
      ],
      commentCount: 2,
    };

    const values = eventListItemToFormValues(event);

    expect(values.name).toBe("Evento");
    expect(values.description).toBe("Descripcion");
    expect(values.notes).toBe("Nota");
    expect(values.tags).toBe("Universidad, Analisis");
    expect(values.fromDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(values.toDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});

describe("updateEventStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("patches the event status through the BFF", async () => {
    const responseBody = { event: { id: "event-1", status: "DONE" } };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(updateEventStatus("event-1", "DONE")).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "DONE" }),
    });
  });
});

describe("deleteEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a delete request to the events BFF route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteEvent("event-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1", {
      method: "DELETE",
    });
  });

  it("throws a DeleteEventError when the BFF rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          message: "Evento no encontrado",
        }),
      }),
    );

    await expect(deleteEvent("missing-event")).rejects.toMatchObject<DeleteEventError>({
      name: "DeleteEventError",
      message: "Evento no encontrado",
      status: 404,
    });
  });

  it("uses a fallback error message when the BFF response body cannot be parsed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      }),
    );

    await expect(deleteEvent("event-1")).rejects.toMatchObject({
      message: "No se pudo eliminar el evento",
      status: 500,
    });
  });
});

describe("searchEventTags", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests tag suggestions from the BFF", async () => {
    const responseBody = {
      items: [{ name: "universidad", label: "Universidad" }],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(searchEventTags(" uni ")).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith("/api/events/tags?name=uni&limit=10");
  });

  it("throws an EventsApiError when tag search fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "No se pudieron buscar tags" }),
      }),
    );

    await expect(searchEventTags("uni")).rejects.toMatchObject<EventsApiError>({
      name: "EventsApiError",
      message: "No se pudieron buscar tags",
      status: 500,
    });
  });
});
