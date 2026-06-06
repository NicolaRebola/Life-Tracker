import { afterEach, describe, expect, it, vi } from "vitest";
import { createEvent, CreateEventError, type EventFormValues } from "./events-api";

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
