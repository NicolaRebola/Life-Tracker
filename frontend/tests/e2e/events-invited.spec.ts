import { expect, test } from "@playwright/test";
import {
  createMockEvent,
  eventCard,
  eventSheet,
  mockDefaultEventsApp,
} from "./helpers/events";

const invitedEvent = createMockEvent({
  id: "evt-invited",
  name: "Evento compartido",
  isCreator: false,
  creator: {
    id: "owner-1",
    displayName: "Owner User",
    email: "owner@example.com",
  },
});

test.describe("invited events", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("shows invited events in kanban without owner actions", async ({ page }) => {
    await mockDefaultEventsApp(page, [invitedEvent]);
    await page.goto("/home/events");

    const card = eventCard(page, invitedEvent.name);
    await expect(card).toBeVisible();
    await expect(card.getByText("Invitado · Creado por Owner User")).toBeVisible();
    await expect(card.locator("span", { hasText: "Invitado" })).toBeVisible();
    await expect(card.getByLabel("Abrir menú del evento")).toHaveCount(0);
    await expect(card.getByLabel(/Abrir comentarios/)).toHaveCount(0);
    await expect(card.getByLabel(/Abrir participantes/)).toHaveCount(0);
  });

  test("shows invited events in calendar without opening edit sheet", async ({ page }) => {
    await mockDefaultEventsApp(page, [invitedEvent]);
    await page.goto("/home/events");
    await page.getByRole("tab", { name: "Calendario" }).click();

    await expect(page.getByText(invitedEvent.name).first()).toBeVisible();
    await expect(page.getByRole("button", { name: invitedEvent.name })).toHaveCount(0);
  });

  test("does not open edit sheet when clicking invited calendar event on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockDefaultEventsApp(page, [invitedEvent]);
    await page.goto("/home/events");
    await page.getByRole("tab", { name: "Calendario" }).click();

    await page.locator("button:has(span.bg-primary-500)").first().click();

    const daySheet = eventSheet(page);
    await expect(daySheet.getByText(invitedEvent.name)).toBeVisible();
    await expect(daySheet.getByText("Invitado · Creado por Owner User")).toBeVisible();
    await expect(daySheet.getByRole("button", { name: "Eliminar" })).toHaveCount(0);
    await expect(daySheet.getByRole("button", { name: /Comentarios/ })).toHaveCount(0);
    await expect(daySheet.getByRole("button", { name: /Participantes/ })).toHaveCount(0);
  });
});
