import { expect, test } from "@playwright/test";
import {
  createMockEvent,
  eventSheet,
  fulfillJson,
  listEventsResponse,
  mockAuthenticatedSession,
  mockDefaultEventsApp,
  mockEventTags,
  type MockEventStatus,
} from "./helpers/events";

test.describe("events kanban", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("changes event status from the mobile card menu", async ({ page }) => {
    let statusPayload: { status?: MockEventStatus } | null = null;
    const event = createMockEvent({ status: "TODO" });

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1/status", async (route) => {
      statusPayload = await route.request().postDataJSON();
      event.status = statusPayload.status ?? event.status;
      return fulfillJson(route, { event: { id: event.id, status: event.status } });
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Abrir menú del evento" }).click();
    await page.getByRole("button", { name: "Mover a In Progress" }).click();

    await expect.poll(() => statusPayload?.status).toBe("IN_PROGRESS");
    await expect(page.getByText("Estado actualizado")).toBeVisible();
  });
});

test.describe("events filters and pagination", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("sends filter query parameters when filtering by name, status and tags", async ({ page }) => {
    const observedQueries: string[] = [];

    await mockAuthenticatedSession(page);
    await mockEventTags(page);
    await page.route("**/api/events?*", (route) => {
      observedQueries.push(new URL(route.request().url()).search);
      return fulfillJson(route, listEventsResponse([createMockEvent()]));
    });

    await page.goto("/home/events");
    await page.getByLabel("Buscar por nombre").fill("reunión");
    await page.getByLabel("Filtrar por estado").selectOption("DONE");
    await page.getByLabel("Filtrar por tags").fill("trabajo");

    await expect
      .poll(() => observedQueries.some((query) => query.includes("name=reuni")))
      .toBe(true);
    await expect
      .poll(() => observedQueries.some((query) => query.includes("status=DONE")))
      .toBe(true);
    await expect
      .poll(() => observedQueries.some((query) => query.includes("tags=trabajo")))
      .toBe(true);
  });

  test("requests the next page and a different page size", async ({ page }) => {
    const observedQueries: string[] = [];

    await mockAuthenticatedSession(page);
    await mockEventTags(page);
    await page.route("**/api/events?*", (route) => {
      observedQueries.push(new URL(route.request().url()).search);
      return fulfillJson(route, {
        items: [createMockEvent()],
        pagination: { page: 1, limit: 10, total: 12, totalPages: 2 },
      });
    });

    await page.goto("/home/events");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByLabel("Eventos por página").selectOption("20");

    await expect
      .poll(() => observedQueries.some((query) => query.includes("page=2")))
      .toBe(true);
    await expect
      .poll(() => observedQueries.some((query) => query.includes("limit=20")))
      .toBe(true);
  });
});

test.describe("events calendar", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("navigates the monthly calendar", async ({ page }) => {
    const observedRanges: string[] = [];

    await mockAuthenticatedSession(page);
    await mockEventTags(page);
    await page.route("**/api/events?*", (route) => {
      observedRanges.push(new URL(route.request().url()).search);
      return fulfillJson(route, listEventsResponse([createMockEvent()], 500));
    });

    await page.goto("/home/events");
    await page.getByRole("tab", { name: "Calendario" }).click();
    await page.getByRole("button", { name: "Mes siguiente" }).click();
    await page.getByRole("button", { name: "Mes anterior" }).click();
    await page.getByRole("button", { name: "Hoy" }).click();

    await expect(page.getByRole("grid", { name: "Calendario mensual" })).toBeVisible();
    await expect
      .poll(() => observedRanges.filter((query) => query.includes("limit=500")).length)
      .toBeGreaterThanOrEqual(3);
  });

  test("opens edit sheet from a desktop calendar event pill", async ({ page }) => {
    const event = createMockEvent({ name: "Evento calendario" });

    await mockDefaultEventsApp(page, [event]);
    await page.goto("/home/events");
    await page.getByRole("tab", { name: "Calendario" }).click();

    await page.getByRole("button", { name: "Evento calendario" }).first().click();

    const sheet = eventSheet(page);
    await expect(sheet.getByText("Editar Evento")).toBeVisible();
    await expect(sheet.getByPlaceholder("Nombre", { exact: true })).toHaveValue(
      "Evento calendario",
    );
  });
});
