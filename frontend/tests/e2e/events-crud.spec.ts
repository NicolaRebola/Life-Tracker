import { expect, test } from "@playwright/test";
import {
  createMockEvent,
  eventSheet,
  fulfillJson,
  mockDefaultEventsApp,
  type MockEvent,
} from "./helpers/events";

test.describe("events CRUD", () => {
  test("creates an event from the add event sheet", async ({ page }) => {
    let createdPayload: unknown = null;
    const events: MockEvent[] = [];

    await mockDefaultEventsApp(page, events);
    await page.route("**/api/events", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();

      createdPayload = await route.request().postDataJSON();
      events.push(createMockEvent({ name: "Nuevo evento e2e" }));
      return fulfillJson(route, { event: events[0] }, 201);
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Agregar Evento" }).click();

    const sheet = eventSheet(page);
    await sheet.getByPlaceholder("Nombre", { exact: true }).fill("Nuevo evento e2e");
    await sheet.getByPlaceholder("Inicio").fill("2026-06-10T09:00");
    await sheet.getByPlaceholder("Fin").fill("2026-06-10T10:00");
    await sheet.getByPlaceholder("Descripción").fill("Descripción creada por e2e");
    await sheet.getByPlaceholder("Notas").fill("Notas creadas por e2e");
    await sheet
      .getByPlaceholder("Tag separados por coma (universidad,analisis matematico)")
      .fill("trabajo, foco");
    await sheet.getByRole("button", { name: "Crear evento" }).click();

    await expect.poll(() => createdPayload).not.toBeNull();
    expect(createdPayload).toMatchObject({
      name: "Nuevo evento e2e",
      description: "Descripción creada por e2e",
      notes: "Notas creadas por e2e",
      tags: ["trabajo", "foco"],
    });
  });

  test("edits an event from the event card menu", async ({ page }) => {
    let updatedPayload: unknown = null;
    const event = createMockEvent({ name: "Evento original" });

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1", async (route) => {
      if (route.request().method() !== "PATCH") return route.fallback();

      updatedPayload = await route.request().postDataJSON();
      event.name = "Evento editado e2e";
      return fulfillJson(route, { event });
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Abrir menú del evento" }).first().click();
    await page.getByRole("button", { name: "Editar" }).click();

    const sheet = eventSheet(page);
    await sheet.getByPlaceholder("Nombre", { exact: true }).fill("Evento editado e2e");
    await sheet.getByRole("button", { name: "Guardar cambios" }).click();

    await expect.poll(() => updatedPayload).not.toBeNull();
    expect(updatedPayload).toMatchObject({ name: "Evento editado e2e" });
  });

  test("deletes an event after confirmation", async ({ page }) => {
    let deletedEventId: string | null = null;
    const event = createMockEvent({ name: "Evento a eliminar" });

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1", async (route) => {
      if (route.request().method() !== "DELETE") return route.fallback();

      deletedEventId = "evt-1";
      return fulfillJson(route, {});
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Abrir menú del evento" }).first().click();
    await page.getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByRole("alertdialog", { name: "Eliminar evento" })).toBeVisible();
    await page
      .getByRole("alertdialog", { name: "Eliminar evento" })
      .getByRole("button", { name: "Eliminar" })
      .click();

    await expect.poll(() => deletedEventId).toBe("evt-1");
  });

  test("shows a form error when event creation fails", async ({ page }) => {
    await mockDefaultEventsApp(page);
    await page.route("**/api/events", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      return fulfillJson(route, { message: "Datos inválidos" }, 400);
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Agregar Evento" }).click();

    const sheet = eventSheet(page);
    await sheet.getByPlaceholder("Nombre", { exact: true }).fill("Evento inválido");
    await sheet.getByPlaceholder("Inicio").fill("2026-06-10T09:00");
    await sheet.getByPlaceholder("Fin").fill("2026-06-10T10:00");
    await sheet.getByRole("button", { name: "Crear evento" }).click();

    await expect(page.getByText("Datos inválidos")).toBeVisible();
  });
});
