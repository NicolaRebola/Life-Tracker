import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEvent,
  CreateEventError,
  listEvents,
  searchEventTags,
  updateEventStatus,
  EventsApiError,
  type EventFormValues,
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
